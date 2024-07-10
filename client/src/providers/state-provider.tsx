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
};

export const CanvasStateContext = createContext<CanvasStateContextType>({
  canvasState: {
    mode: Mode.None,
  },
  setCanvasState: () => {},
});

export const CanvasStateProvider: FC<Props> = ({ children }) => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: Mode.None,
  });

  return (
    <CanvasStateContext.Provider value={{ canvasState, setCanvasState }}>
      {children}
    </CanvasStateContext.Provider>
  );
};
