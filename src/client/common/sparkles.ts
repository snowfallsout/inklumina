interface SparkleStar {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
}

export interface SparkleController {
  start(color: string): void;
  stop(): void;
}

export function createSparkleController(canvas: HTMLCanvasElement, isActive: () => boolean): SparkleController {
  let frameId = 0;
  let sparkleContext: CanvasRenderingContext2D | null = null;
  let sparkleStars: SparkleStar[] = [];
  let tick = 0;
  let activeColor = '#ffffff';
  let resizeAttached = false;

  const resizeCanvas = (): void => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const stop = (): void => {
    if (frameId !== 0) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  const draw = (): void => {
    if (!isActive()) {
      stop();
      return;
    }

    frameId = window.requestAnimationFrame(draw);
    const context = sparkleContext;
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    tick += 1;

    for (const star of sparkleStars) {
      const alpha = (Math.sin(tick * star.speed + star.phase) + 1) / 2;
      const arm = star.size * 3.5;
      context.globalAlpha = alpha * 0.9;
      context.strokeStyle = activeColor;
      context.lineWidth = 1;
      context.shadowBlur = 6;
      context.shadowColor = activeColor;
      context.beginPath();
      context.moveTo(star.x - arm, star.y);
      context.lineTo(star.x + arm, star.y);
      context.moveTo(star.x, star.y - arm);
      context.lineTo(star.x, star.y + arm);
      const diamond = arm * 0.55;
      context.moveTo(star.x - diamond, star.y - diamond);
      context.lineTo(star.x + diamond, star.y + diamond);
      context.moveTo(star.x + diamond, star.y - diamond);
      context.lineTo(star.x - diamond, star.y + diamond);
      context.stroke();
    }

    context.globalAlpha = 1;
    context.shadowBlur = 0;
  };

  const start = (color: string): void => {
    stop();
    activeColor = color;
    resizeCanvas();
    sparkleContext = canvas.getContext('2d');
    if (!sparkleContext) {
      return;
    }

    sparkleStars = Array.from({ length: 40 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.8,
      speed: Math.random() * 0.018 + 0.004,
      phase: Math.random() * Math.PI * 2,
    }));

    tick = 0;

    if (!resizeAttached) {
      window.addEventListener('resize', resizeCanvas);
      resizeAttached = true;
    }

    draw();
  };

  return { start, stop };
}
