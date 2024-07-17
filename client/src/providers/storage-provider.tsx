import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
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
  handleCommand: <T>(command: Command<T>, skipHistory: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  socket: Socket | null;
  cb: (
    payload: CreateLayerPayload | UpdateLayerPayload | DeleteLayerPayload,
    skipPersistence?: boolean
  ) => void;
};

export const StorageContext = createContext<StorageContextType>({
  layers: [],
  setLayers: () => {},
  handleCommand: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: () => false,
  canRedo: () => false,
  socket: null,
  cb: () => {},
});

export const StorageProvider: FC<Props> = ({ children }) => {
  const [layers, setLayers] = useState<Layer[]>([]);

  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000');

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

  const cb = useCallback(
    (
      payload: CreateLayerPayload | UpdateLayerPayload | DeleteLayerPayload,
      skipPersistence?: boolean
    ) => {
      if (skipPersistence) {
        socket?.emit('live-change', payload);
      } else {
        socket?.emit('state-change', payload);
      }
    },
    [socket]
  );

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
          const currentPayload = response.payload.payload;

          if (Object.keys(currentPayload).length === 0) return;

          const updateLayerCmd = new UpdateLayerCommand({
            layerId: response.payload.layerId,
            payload: currentPayload,
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

    if (socket) socket.on('live-change', handleSocketUpdate);

    return () => {
      if (socket) socket.off('live-change', handleSocketUpdate);
    };
  }, [socket]);

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
        cb,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};
