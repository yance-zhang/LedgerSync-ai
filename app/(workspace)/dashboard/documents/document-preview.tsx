"use client";

import Image from "next/image";
import { useState } from "react";
import { Download, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const MIN_SCALE = 0.5;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.25;

export function DocumentPreview({
  fileName,
  isPdf,
  signedUrl,
}: {
  fileName: string;
  isPdf: boolean;
  signedUrl: string;
}) {
  const [zoom, setZoom] = useState(100);

  return (
    <Card className="mt-5 overflow-hidden shadow-none xl:sticky xl:top-5">
      <TransformWrapper
        initialScale={1}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        fitOnInit="contain"
        wheel={{ step: 0.12 }}
        panning={{ velocityDisabled: true }}
        pinch={{ step: 5 }}
        doubleClick={{ mode: "toggle" }}
        onTransform={(_, state) => setZoom(Math.round(state.scale * 100))}
      >
        {({ zoomIn, zoomOut, resetTransform, state }) => (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold">Original document</h2>
                <p className="mt-1 max-w-72 truncate text-xs text-muted-foreground" title={fileName}>
                  {fileName}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Zoom out"
                  title="Zoom out"
                  disabled={state.scale <= MIN_SCALE}
                  onClick={() => void zoomOut(ZOOM_STEP)}
                >
                  <ZoomOut />
                </Button>
                <span className="w-12 text-center text-xs tabular-nums text-muted-foreground" aria-live="polite">
                  {zoom}%
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Zoom in"
                  title="Zoom in"
                  disabled={state.scale >= MAX_SCALE}
                  onClick={() => void zoomIn(ZOOM_STEP)}
                >
                  <ZoomIn />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Reset zoom and position"
                  title="Reset zoom and position"
                  disabled={state.scale === 1 && state.positionX === 0 && state.positionY === 0}
                  onClick={() => resetTransform()}
                >
                  <RotateCcw />
                </Button>
                <a
                  className={buttonVariants({ variant: "outline", size: "sm", className: "ml-1" })}
                  href={signedUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download data-icon="inline-start" />
                  Open original
                </a>
              </div>
            </div>

            <div className="h-[min(72vh,900px)] min-h-[28rem] overflow-hidden bg-muted/40 p-3">
              <TransformComponent
                wrapperClass="!h-full !w-full cursor-grab active:cursor-grabbing"
                contentClass="!h-full !w-full"
              >
                {isPdf ? (
                  <iframe
                    title={`Preview of ${fileName}`}
                    src={signedUrl}
                    className="h-full min-h-[26rem] w-full rounded-lg border-0 bg-background"
                    style={{ pointerEvents: state.scale > 1.001 ? "none" : "auto" }}
                  />
                ) : (
                  <Image
                    unoptimized
                    width={1200}
                    height={1000}
                    sizes="(min-width: 1280px) 50vw, 100vw"
                    src={signedUrl}
                    alt={fileName}
                    draggable={false}
                    className="h-auto max-h-[calc(72vh-2rem)] w-auto max-w-full rounded-lg object-contain"
                  />
                )}
              </TransformComponent>
            </div>
          </>
        )}
      </TransformWrapper>
    </Card>
  );
}
