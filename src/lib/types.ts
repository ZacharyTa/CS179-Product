
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