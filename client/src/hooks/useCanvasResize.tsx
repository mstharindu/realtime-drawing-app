import { useEffect, useState } from 'react';

export const useCanvasResize = (
  canvasRef: React.RefObject<HTMLCanvasElement>
) => {
  const [canvasDimensions, setCanvasDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 800, height: 600 });

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      setCanvasDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [canvasRef]);

  return canvasDimensions;
};
