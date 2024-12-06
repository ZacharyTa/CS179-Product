// pinkDataUtils.ts
import { setPinkData, getPinkData } from "./pinkCookies";

export function addPinkData(row: number, col: number, weight: number, item: string, originalLine: string) {
  const pinkData = [];
  pinkData.push({
    row,
    col,
    weight,
    item,
    originalLine: originalLine || `[${row.toString().padStart(2, "0")},${col.toString().padStart(2, "0")}], {${weight.toString().padStart(5, "0")}}, ${item}`,
  });
  setPinkData(JSON.stringify(pinkData));
  return pinkData;
}

export function deletePinkData() {
  setPinkData("");
  return [];
}

export function getPinkDataArray() {
  // Parse Pink data
  const pinkLines = getPinkData().split("\n");
  console.log("pinkLines", pinkLines);  
  const pinkData: { row: number; col: number; weight: number; item: string; originalLine: string }[] = pinkLines.map((pinkLine) => {
    const data = pinkLine.split(",");
    console.log("pinkData", data);
    if (data.length === 4) {
      const row = parseInt(data[0].trim().substring(1), 10);
      const col = parseInt(data[1].trim().substring(0, 2), 10);
      const weight = parseInt(data[2].trim().substring(1, 6), 10);
      const item = data[3].trim();
      console.log(`Extracted pinkdata: ${row}, ${col}, ${weight}, ${data[3].trim()}`);
      return { row, col, weight, item, originalLine: pinkLine };
    }
    return null;
  }).filter((entry): entry is { row: number; col: number; weight: number; item: string; originalLine: string } => entry !== null);
  return pinkData;
}

export function swapPinkData() {
  const pinkDataString = getPinkData();
  if (!pinkDataString) {
    return [];
  }

  // Parse the JSON string into an array of objects
  const pinkData = getPinkDataArray();

  // // Swap the row and col values
  const newPinkData = pinkData.map((data) => {
    return {
      ...data,
      row: (data.col === 9) ? 5 : 9,
      col: -data.row,
    };
  });

  // Convert the modified array back to a JSON string and save it
  setPinkData(JSON.stringify(newPinkData));
  
  return newPinkData;
}