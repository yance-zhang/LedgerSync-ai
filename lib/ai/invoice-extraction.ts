import { generateText, Output } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { InvoiceParsedSchema } from "@/lib/schemas/invoice";

export async function extractInvoice(
  file: Uint8Array,
  mediaType: string,
  filename: string,
) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API is not configured.");
  }

  // The app uses GEMINI_API_KEY; the provider's default env var is different.
  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });

  const { output } = await generateText({
    model: google("gemini-3.8-flash"),
    output: Output.object({ schema: InvoiceParsedSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: [
              `Document filename: ${filename}`,
              "Read this invoice or receipt and extract its accounting details.",
              "Use the printed final total including taxes, and use an ISO YYYY-MM-DD date.",
              "Use CAD when the document does not make its currency clear.",
              "Choose the closest category from the provided schema.",
              "Do not infer values that are not present. Use an empty string for an unreadable vendor or date, and 0 for an unreadable amount.",
              "Include line items only when they can be read reliably. Keep separately printed discounts, coupons, and instant savings as separate negative line items; do not redistribute them into product prices.",
            ].join(" "),
          },
          { type: "file", data: file, mediaType, filename },
        ],
      },
    ],
  });

  return output;
}
