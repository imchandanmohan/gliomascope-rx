import { useEffect, useRef } from "react";

/**
 * ParticleBackground — crisp, correctly scaled, full-area teal particle field
 * that fills the entire center workspace behind all content.
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setupCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      // devicePixelRatio fix for crispness
      const ratio = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      // match actual pixel buffer to CSS box
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // scale coordinate system so 1 unit = 1 CSS pixel
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    setupCanvas();
    window.addEventListener("resize", setupCanvas);

    const PARTICLE_COUNT = 180;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.8,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
    }));

    let frame: number;
    const draw = () => {
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // transparent dark fill for motion trails
      ctx.fillStyle = "rgba(10,15,25,0.25)";
      ctx.fillRect(0, 0, width, height);

      ctx.shadowColor = "rgba(20,184,166,0.9)";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "rgba(20,184,166,0.8)";

      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;

        // seamless wrap-around motion
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", setupCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}