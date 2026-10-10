// 樱花飘落粒子系统与全屏黑幕转场
import { useEffect, useRef, type FC } from 'react';

interface TransitionOverlayProps {
  isTransitioning: boolean;
  enablePetals?: boolean;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotSpeed: number;
  swaySpeed: number;
  swayAmp: number;
  swayOffset: number;
  opacity: number;
}

export const SakuraTransition: FC<TransitionOverlayProps> = ({
  isTransitioning,
  enablePetals = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enablePetals) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const onResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', onResize);

    const PETAL_COUNT = 32;
    const petals: Petal[] = Array.from({ length: PETAL_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: 8 + Math.random() * 9,
      speedX: 0.8 + Math.random() * 1.5,
      speedY: 1.2 + Math.random() * 1.8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      swaySpeed: 0.015 + Math.random() * 0.02,
      swayAmp: 1.2 + Math.random() * 2.0,
      swayOffset: Math.random() * 100,
      opacity: 0.65 + Math.random() * 0.35,
    }));

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = `rgba(255, 192, 203, ${p.opacity})`;
      ctx.beginPath();
      // 樱花花瓣贝塞尔曲线造型
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, -p.size / 4, p.size, p.size / 2);
      ctx.bezierCurveTo(p.size, p.size, 0, p.size * 1.4, 0, p.size * 1.4);
      ctx.bezierCurveTo(0, p.size * 1.4, -p.size, p.size, -p.size, p.size / 2);
      ctx.bezierCurveTo(-p.size, -p.size / 4, -p.size / 2, -p.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    };

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      for (const p of petals) {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(tick * p.swaySpeed + p.swayOffset) * p.swayAmp;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) {
          p.x = -20;
        }

        drawPetal(p);
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [enablePetals]);

  return (
    <>
      {/* 樱花粒子画布 */}
      {enablePetals && (
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 z-15"
          style={{ mixBlendMode: 'screen' }}
        />
      )}

      {/* 黑幕渐隐渐现遮罩 */}
      <div
        className="pointer-events-none absolute inset-0 z-35 bg-black transition-opacity duration-500 ease-in-out"
        style={{
          opacity: isTransitioning ? 1 : 0,
        }}
      />
    </>
  );
};
