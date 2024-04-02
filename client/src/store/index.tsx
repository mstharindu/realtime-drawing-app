import { createContext } from 'react';

export enum Mode {
  Pen,
  Eraser,
  Rectangle,
  Circle,
  Color,
  Undo,
  Redo,
  Select,
}

export type StateContextType = {
  mode: Mode;
  handleClick: (mode: Mode) => void;
  fillColor: string;
  setFillColor: (color: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  strokeWidth: number;
  setStrokeWidth: (strokeWidth: number) => void;
};

export const StateContext = createContext<StateContextType>({
  mode: Mode.Select,
  handleClick: () => {},
  fillColor: '#FF0000',
  setFillColor: () => {},
  canUndo: true,
  canRedo: true,
  strokeWidth: 5,
  setStrokeWidth: () => {},
});
