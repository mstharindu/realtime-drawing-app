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

export const changeColorScript = (
  setLayers: Dispatch<SetStateAction<Layer[]>>,
  handleCommand: <T>(command: Command<T>, skipHistory: boolean) => void,
  cb: (
    payload: CreateLayerPayload | UpdateLayerPayload | DeleteLayerPayload,
    skipPersistence?: boolean
  ) => void
) => {
  const layerId = nanoid();

  const newLayer = {
    x: Math.floor(Math.random() * 500) + 1,
    y: Math.floor(Math.random() * 500) + 1,
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

  intervalId = setInterval(() => {
    const updateLayerCmd = new UpdateLayerCommand({
      layerId,
      payload: { fill: randomColor() },
      setLayers,
      cb,
      updateLocalState: true,
    });

    handleCommand(updateLayerCmd, false);
  }, 3000);

  return () => clearInterval(intervalId);
};
