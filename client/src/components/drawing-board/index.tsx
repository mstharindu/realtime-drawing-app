import { useContext, useEffect } from 'react';
import { Stage, Layer as KonvaLayer } from 'react-konva';
import { Toolbar } from '../toolbar';
import Rectangle from '../rectangle';
import { Layer, Mode } from '../../types';
import Konva from 'konva';
import { nanoid } from 'nanoid';
import { CanvasStateContext } from '../../providers/state-provider';
import { StorageContext } from '../../providers/storage-provider';
import {
  AtLeastOne,
  CreateLayerCommand,
  DeleteLayerCommand,
  UpdateLayerCommand,
} from '../../commands';
import randomColor from 'randomcolor';
import { Emulator } from '../emulator';

export const DrawingBoard = () => {
  const {
    canvasState,
    setCanvasState,
    selectedLayerId,
    setSelectedLayerId,
    fillColor,
  } = useContext(CanvasStateContext);
  const { layers, setLayers, handleCommand, cb } = useContext(StorageContext);

  useEffect(() => {
    if (selectedLayerId) {
      const updateLayerCmd = new UpdateLayerCommand({
        layerId: selectedLayerId,
        payload: { fill: fillColor },
        setLayers,
        cb,
        updateLocalState: true,
      });

      handleCommand(updateLayerCmd, false);
    }
  }, [fillColor]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          handleLayerRemove();
          break;
        default:
          break;
      }
    };

    const handleLayerRemove = () => {
      if (!selectedLayerId) return;

      const deleteLayerCmd = new DeleteLayerCommand({
        layerId: selectedLayerId,
        setLayers,
        cb,
      });

      handleCommand(deleteLayerCmd, false);
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [selectedLayerId, handleCommand, setLayers]);

  const onPointerDown = (
    e: Konva.KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedLayerId(null);

      if (canvasState.mode === Mode.Insert) return;
      setCanvasState({ mode: Mode.None });
    }
  };

  const onPointerUp = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    //Insert rectangle
    if (canvasState.mode === Mode.Insert) {
      const stage = e.target.getStage();

      if (!stage) return;
      const position = stage.getRelativePointerPosition();

      if (!position) return;

      const newLayer = {
        x: position.x,
        y: position.y,
        width: 100,
        height: 100,
        fill: randomColor(),
        id: nanoid(),
        rotation: 0,
      };

      const createLayerCmd = new CreateLayerCommand({
        layer: newLayer,
        setLayers,
        cb,
      });

      handleCommand(createLayerCmd, false);

      setCanvasState({ mode: Mode.None });
    }
  };

  const handleLayerChange = (
    layerId: string,
    payload: AtLeastOne<Layer>,
    actionEnd: boolean = false
  ) => {
    const updateLayerCmd = new UpdateLayerCommand({
      layerId,
      payload,
      setLayers,
      cb,
      updateLocalState: actionEnd,
      skipPersistence: !actionEnd,
    });

    handleCommand(updateLayerCmd, !actionEnd);
  };

  return (
    <>
      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        onMouseUp={onPointerUp}
      >
        <KonvaLayer>
          {layers.map((rect, i) => {
            return (
              <Rectangle
                key={i}
                shapeProps={rect}
                isSelected={rect.id === selectedLayerId}
                onSelect={() => {
                  setCanvasState({ mode: Mode.Select });
                  setSelectedLayerId(rect.id);
                }}
                onChange={(
                  payload: AtLeastOne<Layer>,
                  actionEnd: boolean = false
                ) => {
                  handleLayerChange(rect.id, payload, actionEnd);
                }}
              />
            );
          })}
        </KonvaLayer>
      </Stage>
      <Toolbar />
      <Emulator />
    </>
  );
};
