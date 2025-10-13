import { useEffect, useRef } from "react";

export default function CosmosAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // early exit if ref not yet attached

    // Make sure we always have valid width/height
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6,
    }));

    let frameId: number;
    const draw = () => {
      if (!ctx) return;
      ctx.fillStyle = "rgba(15,23,42,0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#14b8a6";
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      frameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="flex items-center justify-center bg-slate-900 border-x border-slate-700">
      <canvas
        ref={canvasRef}
        className="w-[300px] h-[300px] bg-slate-900"
      />
    </div>
  );
}