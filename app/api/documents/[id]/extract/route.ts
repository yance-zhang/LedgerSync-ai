import { after, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { extractInvoice } from "@/lib/ai/invoice-extraction";
import { getWorkspaceContext } from "@/lib/workspaces";

export const runtime = "nodejs";
export const maxDuration = 60;

const IdSchema = z.string().uuid();

type ProcessingStage = "initialize" | "load_document" | "download_file" | "ai_extraction" | "save_result";

function getSafeErrorDetails(error: unknown) {
  const pending = [error];
  const visited = new Set<object>();
  let name = "";
  let status: number | undefined;
  let retryable: boolean | undefined;
  let isApiCallError = false;
  let isNoObjectError = false;
  let finishReason: string | undefined;
  let causeName: string | undefined;

  while (pending.length > 0) {
    const current = pending.shift();
    if (typeof current !== "object" || current === null || visited.has(current)) continue;
    visited.add(current);

    const details = current as Record<string, unknown>;
    if (!name && typeof details.name === "string") name = details.name;
    if (typeof details.name === "string" && details.name.endsWith("APICallError")) isApiCallError = true;
    if (typeof details.name === "string" && details.name.endsWith("NoObjectGeneratedError")) isNoObjectError = true;
    if (typeof details.finishReason === "string") finishReason = details.finishReason;
    if (typeof details.name === "string" && details.name.endsWith("NoObjectGeneratedError")
      && typeof details.cause === "object" && details.cause !== null) {
      const cause = details.cause as Record<string, unknown>;
      if (typeof cause.name === "string") causeName = cause.name;
    }
    if (typeof details.statusCode === "number") status = details.statusCode;
    else if (typeof details.status === "number") status = details.status;
    if (typeof details.isRetryable === "boolean") retryable = details.isRetryable;

    if (details.lastError) pending.push(details.lastError);
    if (details.cause) pending.push(details.cause);
  }

  let category = name.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || "unknown";
  if (status === 401) category = "provider_unauthorized";
  else if (status === 403) category = "provider_forbidden";
  else if (status === 429) category = "provider_rate_limit";
  else if (status && status >= 500) category = "provider_unavailable";
  else if (isNoObjectError) {
    if (causeName?.endsWith("TypeValidationError")) category = "no_object_schema_validation";
    else if (causeName?.endsWith("JSONParseError")) category = "no_object_invalid_json";
    else if (finishReason === "length") category = "no_object_output_truncated";
    else if (finishReason === "content-filter") category = "no_object_content_filtered";
    else category = "no_object_generated";
  }
  else if (name.endsWith("TypeValidationError")) category = "invalid_structured_output";
  else if (isApiCallError && retryable) category = "provider_transport_retryable";
  else if (isApiCallError) category = status ? `provider_http_${status}` : "provider_request_failed";
  else if (name === "Error") category = "operation_error";

  return { category, status, retryable, finishReason, causeName };
}

async function processDocument(documentId: string) {
  let stage: ProcessingStage = "initialize";
  let supabase: Awaited<ReturnType<typeof createClient>> | undefined;
  try {
    supabase = await createClient();
    stage = "load_document";
    const { data: document, error: documentError } = await supabase
      .from("documents")
      .select("storage_path, file_name, content_type")
      .eq("id", documentId)
      .single();

    if (documentError || !document) throw new Error("Document is unavailable.");

    stage = "download_file";
    const { data: file, error: fileError } = await supabase.storage
      .from("documents")
      .download(document.storage_path);

    if (fileError || !file) throw new Error("The uploaded file could not be read.");

    stage = "ai_extraction";
    const parsedData = await extractInvoice(
      new Uint8Array(await file.arrayBuffer()),
      document.content_type,
      document.file_name,
    );

    stage = "save_result";
    const { error: saveError } = await supabase
      .from("documents")
      .update({ parsed_data: parsedData, processing_error: null, status: "needs_review" })
      .eq("id", documentId);

    if (saveError) throw new Error("The extraction result could not be saved.");
  } catch (error) {
    const { category, status, retryable, finishReason, causeName } = getSafeErrorDetails(error);
    console.error("Document extraction failed", {
      documentId,
      stage,
      category,
      ...(status ? { httpStatus: status } : {}),
      ...(typeof retryable === "boolean" ? { retryable } : {}),
      ...(finishReason ? { finishReason } : {}),
      ...(causeName ? { cause: causeName.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) } : {}),
    });

    // Client creation can fail before a Supabase client exists. Retry creation
    // only for recording failure state, and never let a second error hide logs.
    try {
      const client = supabase ?? await createClient();
      const { error: updateError } = await client
        .from("documents")
        .update({
          processing_error: `Extraction failed during ${stage} (${category}).`,
          status: "failed",
        })
        .eq("id", documentId);
      if (updateError) {
        console.error("Could not save document extraction failure", {
          documentId,
          stage: "save_failure_state",
          ...getSafeErrorDetails(updateError),
        });
      }
    } catch (updateError) {
      console.error("Could not save document extraction failure", {
        documentId,
        stage: "save_failure_state",
        ...getSafeErrorDetails(updateError),
      });
    }
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!IdSchema.safeParse(id).success) {
    return NextResponse.json({ error: "Invalid document." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
  const { current } = await getWorkspaceContext();
  if (!current) return NextResponse.json({ error: "No active workspace is available." }, { status: 404 });

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, status")
    .eq("id", id)
    .eq("organization_id", current.id)
    .maybeSingle();

  if (documentError || !document) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }
  if (document.status === "processing") {
    return NextResponse.json({ error: "Extraction is already running." }, { status: 409 });
  }
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API is not configured on the server." }, { status: 503 });
  }

  const { data: claimedDocument, error: updateError } = await supabase
    .from("documents")
    .update({ status: "processing", processing_error: null })
    .eq("id", id)
    .neq("status", "processing")
    .select("id")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ error: "Could not start document extraction." }, { status: 500 });
  }
  if (!claimedDocument) {
    return NextResponse.json({ error: "Extraction is already running." }, { status: 409 });
  }

  after(() => processDocument(id));
  return NextResponse.json({ status: "processing" }, { status: 202 });
}
