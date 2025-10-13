// src/hooks/useImageProcessor.ts
import { useEffect, useMemo, useRef, useState } from "react";
import type { EnhancementState } from "../types";

export function useImageProcessor(panelSize: { w: number; h: number }) {
  const workerRef = useRef<Worker | null>(null);
  const [ready, setReady] = useState(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const w = new Worker(new URL("../lib/imageWorker.ts", import.meta.url), { type: "module" });
    workerRef.current = w;
    w.onmessage = (e: MessageEvent) => {
      const msg = e.data;
      if (msg.type === "READY") setReady(true);
      if (msg.type === "APPLIED") {
        if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
        lastUrlRef.current = msg.url;
        setProcessedUrl(msg.url);
      }
    };
    return () => {
      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
      w.terminate();
    };
  }, []);

  const setBaseImage = async (dataUrl: string) => {
    setReady(false);
    const bmp = await createImageBitmap(await (await fetch(dataUrl)).blob());
    workerRef.current?.postMessage({ type: "SET_IMAGE", bitmap: bmp }, [bmp]);
  };

  const apply = (params: EnhancementState) => {
    workerRef.current?.postMessage({ type: "APPLY", params, maxW: panelSize.w, maxH: panelSize.h });
  };

  return { ready, setBaseImage, apply, processedUrl };
}