// this util helepr will actually apply the operations to the manifestData
"use client";
import { OutputLoadOperation } from "@/lib/types";
import { getManifestData, setManifestData } from "@/utils/manifestCookies";
import { getBufferData, setBufferData } from "@/utils/bufferCookies";
import { addLog } from "@/utils/logCookies";

//TODO: needa handle how to handle buffer
// buffer coords are (row, -col)
// 1. Add operation.type === 'buffer'
// 2. buffer operation type essentially is a move operation, except it needs to search index on the manifestData AND bufferData
//  - BufferData's data format will still be the same as manifestData(row, -col)
//  - When column data is negative, it implcitiy implies to search in bufferData
//  - Need to save bufferData into Cookies
// 3. Create a BufferGrid component (same as ShipGrid, except dimensions are (4x24), and dir="rtl"
// 4. I think we can keep the useGridData.ts logic the same?

export default function applyOperation(
  operation: OutputLoadOperation,
) {
  // extract the row, col, item, weight from the manifestText
  const manifestLines = getManifestData().split("\n");
  const manifestData = manifestLines.map((manifestLine) => {
    const data = manifestLine.split(",");
    if (data.length === 4) {
      // now extract
      const row = parseInt(data[0].trim().substring(1), 10);
      const col = parseInt(data[1].trim().substring(0, 2), 10);
      const weight = parseInt(data[2].trim().substring(1, 6), 10);
      const item = data[3].trim();
      // console.log(`Extracted data: ${row}, ${col}, ${weight}, ${item}`)
      return { row, col, weight, item, originalLine: manifestLine };
    }
    // if invalid return null
    return null;
  });

  console.log("manifestData", manifestData);

  // extract the row, col, item, weight from the bufferText
  const bufferLines = getBufferData().split("\n");
  const bufferData = bufferLines.map((bufferLine) => {
    const data = bufferLine.split(",");
    if (data.length === 4) {
      // now extract
      const row = parseInt(data[0].trim().substring(1), 10);
      const col = parseInt(data[1].trim().substring(0, 2), 10);
      const weight = parseInt(data[2].trim().substring(1, 6), 10);
      const item = data[3].trim();
      // console.log(`Extracted data: ${row}, ${col}, ${weight}, ${item}`)
      return { row, col, weight, item, originalLine: bufferLine };
    }
    // if invalid return null
    return null;
  });

  // handle buffer
  if (operation.type === "buffer") {
    console.log("Handling buffer operation: ", operation);

    // find source (then copy from source and and set item/weight to UNUISED and 0)

    const isOldInBuffer = operation.oldColumn < 0;
    const isNewInBuffer = operation.newColumn < 0;

    let container = null;
    // check source in buffer
    if (isOldInBuffer) {
      const index = bufferData.findIndex(
      (entry) =>
        entry &&
        entry.row === operation.oldRow &&
        entry.col === -operation.oldColumn &&
        entry.item !== "UNUSED" &&
        entry.item !== "NAN",
    );

    if (!bufferData[index]) return;
    

    if (index !== -1) {
      container = { ...bufferData[index] }; //Shallow copy to prevent race condition
      bufferData[index].weight = 0;
      bufferData[index].item = "UNUSED";
    }
    } else { // check source in manifest
      const index = manifestData.findIndex(
      (entry) =>
        entry &&
        entry.row === operation.oldRow &&
        entry.col === operation.oldColumn &&
        entry.item !== "UNUSED" &&
        entry.item !== "NAN",
    );

    if (!manifestData[index]) return;
    

    if (index !== -1) {
      container = { ...manifestData[index] }; //Shallow copy to prevent race condition
      manifestData[index].weight = 0;
      manifestData[index].item = "UNUSED";
    }
    }

    // Now we place container into destination
    if (container) {
      // placing container in buffer
      if (isNewInBuffer) {
        const newIndex = bufferData.findIndex(
        (entry) =>
          entry &&
          entry.row === operation.newRow &&
          entry.col === -operation.newColumn &&
          entry.item === "UNUSED"
      );

      if (!bufferData[newIndex]) return;

      if (newIndex !== -1) {
        // thisll update the new location with the container ("swapping locations")
        bufferData[newIndex].weight = container.weight;
        bufferData[newIndex].item = container.item;
      }
      } else { // placing container in manifest
        const newIndex = manifestData.findIndex(
        (entry) =>
          entry &&
          entry.row === operation.newRow &&
          entry.col === operation.newColumn &&
          entry.item === "UNUSED"
      );

      if (!manifestData[newIndex]) return;

      if (newIndex !== -1) {
        // thisll update the new location with the container ("swapping locations")
        manifestData[newIndex].weight = container.weight;
        manifestData[newIndex].item = container.item;
      }
      }
    }
  }
  //handle move
  else if (operation.type === "move") {
    //{type: "move", name: "Beans", time: 1, oldRow: 1, oldColumn: 4, newRow: 1, newColumn: 5},
    // console.log("Handling move operation: ", operation);
    const index = manifestData.findIndex(
      (entry) =>
        entry &&
        entry.row === operation.oldRow &&
        entry.col === operation.oldColumn &&
        entry.item !== "UNUSED" &&
        entry.item !== "NAN",
    );

    if (!manifestData[index]) return;

    if (index !== -1) {
      const container = manifestData[index];
      // console.log("found container: ", container);
      const newIndex = manifestData.findIndex(
        (entry) =>
          entry &&
          entry.row === operation.newRow &&
          entry.col === operation.newColumn,
      );

      if (!manifestData[newIndex]) return;

      if (newIndex !== -1) {
        // thisll update the new location with the container ("swapping locations")
        manifestData[newIndex].weight = container.weight;
        manifestData[newIndex].item = container.item;
        console.log(
          "updated existing location with container:",
          manifestData[newIndex],
        );
      } else {
        // maybe add new entry if newIndex doesn't exist
        console.log("adding new location with container:");
      }

      // update old location with UNUSED
      manifestData[index].weight = 0;
      manifestData[index].item = "UNUSED";
    } else {
      console.log("Error: Container not moved");
    }
  }

  //handle offload
  else if (operation.type === "offload") {
    // console.log("Handling offload:", operation);
    addLog(`\"${operation.name}\" is offloaded.`)

    const index = manifestData.findIndex(
      (entry) =>
        entry &&
        entry.row === operation.oldRow &&
        entry.col === operation.oldColumn &&
        entry.item !== "UNUSED" &&
        entry.item !== "NAN",
    );

    if (!manifestData[index]) return;

    if (index !== -1) {
      // set the location to "unused"
      manifestData[index].weight = 0;
      manifestData[index].item = "UNUSED";
      console.log("Offloaded container:", manifestData[index]);
    } else {
      console.log("Container to offload not found");
    }
  }

  //handle onload
  else if (operation.type === "onload") {
    // console.log("Handling onload:", operation);
    addLog(`\"${operation.name}\" is onloaded.`)

    // add new entry
    const newEntry = {
      row: operation.newRow,
      col: operation.newColumn,
      weight: operation.weight ? operation.weight  : 0,
      item: operation.name,
      originalLine: `[${operation.newRow.toString().padStart(2, "0")},${operation.newColumn.toString().padStart(2, "0")}], {00000}, ${operation.name}`,
    };

    //check if new location already exists
    const index = manifestData.findIndex(
      (entry) =>
        entry &&
        entry.row === operation.newRow &&
        entry.col === operation.newColumn &&
        entry.item === "UNUSED",
    );

    if (index !== -1) {
      // if location already exists thennnnn smth is wrong
      manifestData[index] = newEntry;
      console.log(
        "Yayyy Updated existing location with new container:",
        manifestData[index],
      );
    } else {
      // if location already exists thennnnn smth is wrong
      console.log(
        "Error: Tried to onload container into location thats already occupied or can't be moved to",
        manifestData[index],
        newEntry,
      );
    }
  }

  //return updated manifestText
  const updatedManifestLines = manifestData
    .filter((entry) => entry)
    .map((entry) => {
      return `[${entry?.row.toString().padStart(2, "0")},${entry?.col.toString().padStart(2, "0")}], {${entry?.weight.toString().padStart(5, "0")}}, ${entry?.item}`;
    }).join("\n");

  const updatedBufferLines = bufferData
    .filter((entry) => entry)
    .map((entry) => {
      return `[${entry?.row.toString().padStart(2, "0")},${entry?.col.toString().padStart(2, "0")}], {${entry?.weight.toString().padStart(5, "0")}}, ${entry?.item}`;
    }).join("\n");

  
    // Update cookies
    setManifestData(updatedManifestLines);
    setBufferData(updatedBufferLines); //TODO
}
