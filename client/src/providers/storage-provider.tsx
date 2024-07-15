import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from 'react';
import { Layer } from '../types';
import { useHistory } from '../hooks/useHistory';
import {
  Command,
  CreateLayerCommand,
  CreateLayerPayload,
  DeleteLayerCommand,
  DeleteLayerPayload,
  UpdateLayerCommand,
  UpdateLayerPayload,
} from '../commands';
import { io, Socket } from 'socket.io-client';
//import randomColor from 'randomcolor';

// const initialRectangles = [
//   {
//     x: 10,
//     y: 10,
//     width: 100,
//     height: 100,
//     fill: randomColor(),
//     id: 'rect1',
//     rotation: 0,
//   },
//   {
//     x: 150,
//     y: 150,
//     width: 100,
//     height: 100,
//     fill: randomColor(),
//     id: 'rect2',
//     rotation: 0,
//   },
// ];

interface Props {
  children?: ReactNode;
}

type StorageContextType = {
  layers: Layer[];
  setLayers: Dispatch<SetStateAction<Layer[]>>;
  setSelectedPayload: Dispatch<SetStateAction<SelectedPayload | null>>;
  handleCommand: <T>(command: Command<T>, skipHistory: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  socket: Socket | null;
};

export const StorageContext = createContext<StorageContextType>({
  layers: [],
  setLayers: () => {},
  setSelectedPayload: () => {},
  handleCommand: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: () => false,
  canRedo: () => false,
  socket: null,
});

export interface SelectedPayload {
  layerId: string;
  affectedAttributes: string[];
}

export const StorageProvider: FC<Props> = ({ children }) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedPayload, setSelectedPayload] =
    useState<SelectedPayload | null>(null);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000');

    // listen for events emitted by the server
    socketInstance.on('connect', () => {
      console.log('Connected to server');
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [setSocket]);

  useEffect(() => {
    const handleSocketUpdate = (
      response: CreateLayerPayload | UpdateLayerPayload | DeleteLayerPayload
    ) => {
      switch (response.action) {
        case 'create': {
          const createCommand = new CreateLayerCommand({
            layer: response.payload.layer,
            setLayers,
            cb: () => {},
          });

          createCommand.execute();
          break;
        }
        case 'delete': {
          const deleteLayerCmd = new DeleteLayerCommand({
            layerId: response.payload.layerId,
            setLayers,
            cb: () => {},
          });

          deleteLayerCmd.execute();
          break;
        }
        case 'update': {
          let payloadClone: Partial<Layer> = {};
          const currentPayload = response.payload.payload;

          if (selectedPayload?.layerId === response.payload.layerId) {
            selectedPayload.affectedAttributes.forEach((attr: string) => {
              const typedAttr = attr as keyof Layer;
              const currentAttrValue = currentPayload[typedAttr];
              if (currentAttrValue !== undefined) {
                payloadClone = {
                  ...payloadClone,
                  [typedAttr]: currentAttrValue,
                };
              }
            });
          } else {
            payloadClone = { ...currentPayload };
          }

          if (Object.keys(payloadClone).length === 0) return;

          const updateLayerCmd = new UpdateLayerCommand({
            layerId: response.payload.layerId,
            payload: payloadClone,
            setLayers,
            cb: () => {},
            updateLocalState: true,
          });

          updateLayerCmd.execute();

          break;
        }
        default:
          break;
      }
    };

    if (socket) socket.on('layer-change', handleSocketUpdate);

    return () => {
      if (socket) socket.off('layer-change', handleSocketUpdate);
    };
  }, [socket, selectedPayload]);

  const { execute, undo, redo, canUndo, canRedo } = useHistory();

  const handleCommand = <T,>(
    command: Command<T>,
    skipHistory: boolean = false
  ) => {
    if (skipHistory) {
      command.execute();
      return;
    }

    execute(command);
  };

  return (
    <StorageContext.Provider
      value={{
        layers,
        setLayers,
        handleCommand,
        undo,
        redo,
        canUndo,
        canRedo,
        socket,
        setSelectedPayload,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};
