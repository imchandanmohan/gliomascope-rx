import { useEffect, useRef, useState } from "react";

type ImagePanelProps = {
  title: string;
  imageSrc?: string;
  scanning?: boolean;
  onCrop?: (img: string) => void;
};

export default function ImagePanel({ title, imageSrc, scanning, onCrop }: ImagePanelProps) {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ROI selection state
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [end, setEnd] = useState<{ x: number; y: number } | null>(null);

  // scanning beam
  useEffect(() => {
    if (!scanning) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setPosition(0);
      setDirection(1);
      return;
    }
  
    const animate = () => {
      setPosition((p) => {
        let next = p + direction * 1.2;
        if (next > 100) {
          next = 100;
          setDirection(-1);
        } else if (next < 0) {
          next = 0;
          setDirection(1);
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
  
    rafRef.current = requestAnimationFrame(animate);
  
    // ✅ fixed cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [scanning, direction]);

  // draw image and selection box
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // fit image inside canvas
      const scale = Math.min(width / img.width, height / img.height);
      const x = (width - img.width * scale) / 2;
      const y = (height - img.height * scale) / 2;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

      // draw selection if dragging
      if (start && end) {
        const rectX = Math.min(start.x, end.x);
        const rectY = Math.min(start.y, end.y);
        const rectW = Math.abs(start.x - end.x);
        const rectH = Math.abs(start.y - end.y);
        ctx.strokeStyle = "rgba(20,184,166,0.8)";
        ctx.lineWidth = 2;
        ctx.strokeRect(rectX, rectY, rectW, rectH);
        ctx.fillStyle = "rgba(20,184,166,0.2)";
        ctx.fillRect(rectX, rectY, rectW, rectH);
      }
    };
  }, [imageSrc, start, end]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setEnd(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!start) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    if (!start || !end || !onCrop) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(start.x - end.x);
    const h = Math.abs(start.y - end.y);
    if (w < 10 || h < 10) {
      setStart(null);
      setEnd(null);
      return; // too small
    }

    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    const tctx = temp.getContext("2d");
    if (tctx) {
      tctx.drawImage(canvas, x, y, w, h, 0, 0, w, h);
      const cropped = temp.toDataURL("image/png");
      onCrop(cropped);
    }
    setStart(null);
    setEnd(null);
  };

  return (
    <div className="relative flex flex-col items-center justify-center bg-slate-900 border border-slate-700 rounded-lg shadow-lg p-2 w-full h-[360px] overflow-hidden">
      <div className="absolute top-2 left-3 text-xs uppercase tracking-wider text-slate-400">
        {title}
      </div>

      {imageSrc ? (
        <canvas
          ref={canvasRef}
          width={400}
          height={350}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="rounded-md cursor-crosshair"
        />
      ) : (
        <div className="text-slate-600 text-sm">No image loaded</div>
      )}

      {scanning && (
        <div
          className="absolute top-0 bottom-0 w-[25%] bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"
          style={{
            left: `${position}%`,
            transform: "translateX(-50%)",
          }}
        />
      )}
    </div>
  );
}