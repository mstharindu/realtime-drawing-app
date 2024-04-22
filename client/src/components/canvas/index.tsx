import React, { useCallback, useRef, useState } from 'react';
import { Toolbar } from '../toolbar';

import './styles.css';
import { Mode, StateContext } from '../../store';
import { Layer } from '../../models/Layer';
import { v4 as uuidv4 } from 'uuid';
import { AddLayerCommand } from '../../models/Command';
import { useHistory } from '../../hooks/useHistory';
import { useCanvasDrawing } from '../../hooks/useCanvasDraw';
import { useCanvasResize } from '../../hooks/useCanvasResize';
import { usePointerMove } from '../../hooks/usePointerMove';
import { useKeyPress } from '../../hooks/useKeyPress';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { execute, undo, redo, canUndo, canRedo } = useHistory();

  const canvasDimensions = useCanvasResize(canvasRef);
  const pointerPosition = usePointerMove();

  const [mode, setMode] = useState<Mode>(Mode.Pen);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [pointerDown, setPointerDown] = useState<boolean>(false);
  const [layerDraft, setLayerDraft] = useState<Layer | null>(null);
  const [fillColor, setFillColor] = useState<string>('#FF0000');
  const [strokeWidth, setStrokeWidth] = useState<number>(5);

  useCanvasDrawing(
    canvasRef,
    layers,
    canvasDimensions,
    pointerPosition,
    strokeWidth,
    layerDraft
  );

  const handleClick = useCallback(
    (mode: Mode) => {
      switch (mode) {
        case Mode.Pen:
        case Mode.Eraser:
          setMode(mode);
          break;
        case Mode.Undo:
          if (!canUndo) break;
          undo();
          break;
        case Mode.Redo:
          if (!canRedo) break;
          redo();
          break;
      }
    },
    [canUndo, canRedo, undo, redo]
  );

  useKeyPress(handleClick);

  const handlePointerDown = () => {
    setPointerDown(true);

    if (mode === Mode.Pen || mode === Mode.Eraser) {
      setLayerDraft({
        id: uuidv4(),
        shape: [],
        color: mode === Mode.Pen ? fillColor : '#FFFFFF',
        strokeWidth,
      });
    }
  };

  const handlePointerUp = () => {
    setPointerDown(false);

    if (!layerDraft) return;

    if (mode === Mode.Pen || mode === Mode.Eraser) {
      const addLayerCommand = new AddLayerCommand({
        layer: layerDraft,
        setLayers,
      });

      execute(addLayerCommand);

      setLayerDraft(null);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerDown) return;

    if (!layerDraft) return;

    if (mode === Mode.Pen || mode === Mode.Eraser) {
      setLayerDraft((prevLayer) => {
        if (!prevLayer) return null;

        return {
          ...prevLayer,
          shape: [...prevLayer.shape, [e.clientX, e.clientY]],
        };
      });

      return;
    }
  };

  return (
    <StateContext.Provider
      value={{
        mode,
        handleClick,
        fillColor,
        setFillColor,
        canUndo: canUndo(),
        canRedo: canRedo(),
        strokeWidth,
        setStrokeWidth,
      }}
    >
      <Toolbar />
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      />
    </StateContext.Provider>
  );
};
