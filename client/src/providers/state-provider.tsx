import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useState,
} from 'react';
import { CanvasState, Mode } from '../types';

interface Props {
  children?: ReactNode;
}

type CanvasStateContextType = {
  canvasState: CanvasState;
  setCanvasState: Dispatch<SetStateAction<CanvasState>>;
  selectedLayerId: string | null;
  setSelectedLayerId: Dispatch<SetStateAction<string | null>>;
  fillColor: string;
  setFillColor: Dispatch<SetStateAction<string>>;
};

export const CanvasStateContext = createContext<CanvasStateContextType>({
  canvasState: {
    mode: Mode.None,
  },
  setCanvasState: () => {},
  selectedLayerId: null,
  setSelectedLayerId: () => {},
  fillColor: '#FCB900',
  setFillColor: () => {},
});

export const CanvasStateProvider: FC<Props> = ({ children }) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: Mode.None,
  });

  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [fillColor, setFillColor] = useState<string>('#ff0000');

  return (
    <CanvasStateContext.Provider
      value={{
        canvasState,
        setCanvasState,
        selectedLayerId,
        setSelectedLayerId,
        fillColor,
        setFillColor,
      }}
    >
      {children}
    </CanvasStateContext.Provider>
  );
};
