import randomColor from 'randomcolor';
import { nanoid } from 'nanoid';
import {
  Command,
  CreateLayerCommand,
  CreateLayerPayload,
  DeleteLayerPayload,
  UpdateLayerCommand,
  UpdateLayerPayload,
} from '../commands';
import { Dispatch, SetStateAction } from 'react';
import { Layer } from '../types';

let intervalId: NodeJS.Timeout;

export const createAndMoveScript = (
  setLayers: Dispatch<SetStateAction<Layer[]>>,
  handleCommand: <T>(command: Command<T>, skipHistory: boolean) => void,
  cb: (
    payload: CreateLayerPayload | UpdateLayerPayload | DeleteLayerPayload,
    skipPersistence?: boolean
  ) => void
) => {
  const layerId = nanoid();

  let x = Math.floor(Math.random() * 600) + 200;
  let y = Math.floor(Math.random() * 600) + 200;

  const newLayer = {
    x,
    y,
    width: Math.floor(Math.random() * 100) + 20,
    height: Math.floor(Math.random() * 100) + 20,
    fill: randomColor(),
    id: layerId,
    rotation: 0,
  };

  const createLayerCmd = new CreateLayerCommand({
    layer: newLayer,
    setLayers,
    cb,
  });

  handleCommand(createLayerCmd, false);

  const speed = 50;
  const radius = 20;
  let angle = 0;

  intervalId = setInterval(() => {
    x = x + radius * Math.cos(angle);
    y = y + radius * Math.sin(angle);

    const updateLayerCmd = new UpdateLayerCommand({
      layerId,
      payload: { x, y },
      setLayers,
      cb,
      updateLocalState: true,
    });

    handleCommand(updateLayerCmd, false);

    angle += speed;
  }, speed);

  return () => clearInterval(intervalId);
};
