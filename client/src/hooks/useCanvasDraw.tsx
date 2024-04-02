import { useEffect } from 'react';
import { Layer } from '../models/Layer';
import { PointerPosition } from './usePointerMove';

export const useCanvasDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  layers: Layer[],
  canvasDimensions: {
    width: number;
    height: number;
  },
  pointerPosition: PointerPosition,
  strokeWidth: number
) => {
  useEffect(() => {
    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      clearCanvas(ctx, canvas);
      drawLayers(ctx, layers);
      drawPointer(ctx, pointerPosition, strokeWidth);
    };

    drawCanvas();
  }, [layers, canvasDimensions, pointerPosition, strokeWidth, canvasRef]);
};

const clearCanvas = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

const drawLayers = (ctx: CanvasRenderingContext2D, layers: Layer[]) => {
  layers.forEach((layer) => {
    drawLayer(ctx, layer);
  });
};

const drawLayer = (ctx: CanvasRenderingContext2D, layer: Layer) => {
  ctx.beginPath();
  layer.shape.forEach(([x, y], index) => {
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.strokeStyle = layer.color;
  ctx.lineCap = 'round';
  ctx.lineWidth = layer.strokeWidth;
  ctx.stroke();
};

const drawPointer = (
  ctx: CanvasRenderingContext2D,
  pointerPosition: PointerPosition,
  strokeWidth: number
) => {
  ctx.beginPath();
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.arc(
    pointerPosition[0],
    pointerPosition[1],
    strokeWidth / 2,
    0,
    2 * Math.PI
  );
  ctx.stroke();
};
