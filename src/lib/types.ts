// [row, col], {weight}, itemName
export interface Container {
  index?: number;
  item: string;
  location: { row: number; col: number };
  weight: number;
}

export interface ManifestData {
  containers: Container[];
  columns: number;
  rows: number;
}

export interface InputOperation {
  type: "offload" | "onload";
  name: string;
}

//[{type, name, time, oldRow, oldColumn, newRow, newColumn}, ...]
export interface OutputLoadOperation {
  type: "offload" | "onload" | "move";
  name: string;
  time: number;
  oldRow: number;
  oldColumn: number;
  newRow: number;
  newColumn: number;
}
