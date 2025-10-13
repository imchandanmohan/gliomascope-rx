import { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
  Upload,
  Sliders,
  BarChart2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Info,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import EnhancementTools from "./EnhancementTools";
import type { EnhancementState } from "../types";

function drawHistogram(canvas: HTMLCanvasElement, img: HTMLImageElement | ImageBitmap) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const histR = new Uint32Array(256);
  const histG = new Uint32Array(256);
  const histB = new Uint32Array(256);
  for (let i = 0; i < d.length; i += 4) {
    histR[d[i]]++;
    histG[d[i + 1]]++;
    histB[d[i + 2]]++;
  }
  const max = Math.max(...histR, ...histG, ...histB);

  ctx.fillStyle = "#0b1220";
  ctx.fillRect(0, 0, w, h);

  const drawCurve = (hist: Uint32Array, color: string) => {
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      const x = (i / 255) * w;
      const y = h - (hist[i] / max) * h;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  };

  drawCurve(histR, "#f87171"); // red
  drawCurve(histG, "#4ade80"); // green
  drawCurve(histB, "#60a5fa"); // blue
}

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(1)} ${units[i]}`;
}

export default function EnhancementConsole({
  onImageSelected,
  enh,
  setEnh,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  processedUrl,
}: {
  onImageSelected: (dataUrl: string) => void;
  enh: EnhancementState;
  setEnh: (v: EnhancementState) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  processedUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ w: number; h: number; size: number; type: string } | null>(
    null
  );
  const histRef = useRef<HTMLCanvasElement | null>(null);

  const onDrop = useCallback(
    (files: File[]) => {
      const file = files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPreview(url);
        onImageSelected(url);

        const img = new Image();
        img.src = url;
        img.onload = () =>
          setMeta({ w: img.width, h: img.height, size: file.size, type: file.type });
      };
      reader.readAsDataURL(file);
    },
    [onImageSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [".png", ".jpg", ".jpeg"] },
  });

  useEffect(() => {
    const src = processedUrl || preview;
    if (!src || !histRef.current) return;
    const img = new Image();
    img.src = src;
    img.onload = () => drawHistogram(histRef.current!, img);
  }, [processedUrl, preview]);

  const handleRotate = () => setEnh({ ...enh, rotate: (enh.rotate + 90) % 360 });
  const handleFlipH = () => setEnh({ ...enh, flipH: !enh.flipH });
  const handleFlipV = () => setEnh({ ...enh, flipV: !enh.flipV });

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
      {/* === Upload + Metadata + Histogram === */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <h2 className="text-xs uppercase text-slate-400 tracking-wider">Upload Image</h2>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-3 text-sm bg-slate-900 cursor-pointer transition
            ${
              isDragActive
                ? "border-teal-400 bg-slate-700/40"
                : "border-slate-600 hover:bg-slate-700/40"
            }`}
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-center gap-2">
            <Upload size={16} className="text-teal-400" />
            <span>Drop or click to upload</span>
          </div>
        </div>

        {meta && (
          <div className="rounded-md border border-slate-700 bg-slate-900 p-2 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Info size={12} /> Image Metadata
            </div>
            <div>Resolution: {meta.w} × {meta.h}</div>
            <div>Type: {meta.type}</div>
            <div>Size: {formatBytes(meta.size)}</div>
          </div>
        )}

        {/* RGB Histogram */}
        <div className="rounded-md border border-slate-700 bg-slate-900 p-2">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <BarChart2 size={12} /> RGB Curves
          </div>
          <canvas ref={histRef} width={260} height={100} className="w-full h-24" />
        </div>
      </div>

      {/* === Enhancement Section === */}
      <div className="p-4 space-y-3">
        <motion.div layout className="rounded-lg border border-slate-700 bg-slate-900/70">
          <div className="flex items-center gap-2 px-3 py-2 text-xs uppercase text-slate-400 border-b border-slate-700">
            <Sliders size={14} className="text-teal-400" /> Enhancement
          </div>

          <div className="p-2">
            <EnhancementTools
              value={enh}
              onChange={setEnh}
              onUndo={onUndo}
              onRedo={onRedo}
              canUndo={canUndo}
              canRedo={canRedo}
            />

            {/* Rotate / Flip Controls */}
            <div className="flex items-center justify-between mt-4 text-sm text-slate-300">
              <span className="text-xs uppercase text-slate-400">Orientation</span>
              <div className="flex gap-2">
                <button
                  onClick={handleRotate}
                  className="p-1.5 rounded-md hover:bg-slate-700 text-teal-400"
                  title="Rotate 90°"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  onClick={handleFlipH}
                  className={`p-1.5 rounded-md hover:bg-slate-700 ${
                    enh.flipH ? "bg-slate-700" : ""
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal size={16} />
                </button>
                <button
                  onClick={handleFlipV}
                  className={`p-1.5 rounded-md hover:bg-slate-700 ${
                    enh.flipV ? "bg-slate-700" : ""
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* === Footer === */}
      <footer className="p-3 border-t border-slate-800 text-xs text-slate-500 mt-auto">
        <div className="flex items-center gap-2 mb-1">
          <Activity size={12} className="text-teal-400" />
          <span>GliomaScope RX</span>
        </div>
        <div>Version 1.0.0</div>
        <div>© 2025 GliomaScope Lab</div>
        <div className="text-teal-400">Developed by GliomaScope Team</div>
      </footer>
    </aside>
  );
}