export enum Shape {
  Rectangle,
}

export type RectangleShape = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
};

export type Layer = RectangleShape;

export enum Mode {
  None,
  Insert,
  Move,
  Scale,
  Select,
}

export type CanvasState =
  | {
      mode: Mode.None;
    }
  | {
      mode: Mode.Select;
    }
  | {
      mode: Mode.Move;
    }
  | {
      mode: Mode.Scale;
    }
  | {
      mode: Mode.Insert;
      type: Shape.Rectangle;
    };
