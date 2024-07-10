import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from 'react';
import { Layer } from '../types';
import { useHistory } from '../hooks/useHistory';
import { Command } from '../commands';
import randomColor from 'randomcolor';

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
    fill: randomColor(),
    id: 'rect1',
    rotation: 0,
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    fill: randomColor(),
    id: 'rect2',
    rotation: 0,
  },
];

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
};

export const StorageContext = createContext<StorageContextType>({
  layers: [],
  setLayers: () => {},
  handleCommand: () => {},
  undo: () => {},
  redo: () => {},
  canUndo: () => false,
  canRedo: () => false,
});

export const StorageProvider: FC<Props> = ({ children }) => {
  const [layers, setLayers] = useState<Layer[]>([...initialRectangles]);

  const { execute, undo, redo, canUndo, canRedo } = useHistory();

  const handleCommand = <T,>(
    command: Command<T>,
    skipHistory: boolean = false
  ) => {
    if (!skipHistory) execute(command);
  };

  return (
    <StorageContext.Provider
      value={{ layers, setLayers, handleCommand, undo, redo, canUndo, canRedo }}
    >
      {children}
    </StorageContext.Provider>
  );
};
