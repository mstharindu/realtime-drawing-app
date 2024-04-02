export interface Layer {
  id: string;
  shape: Array<[number, number]>; // Array of points
  color: string;
  strokeWidth: number;
}
