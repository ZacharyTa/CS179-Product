// this util helepr will actually apply the operations to the manifestData
"use client";
import { OutputLoadOperation } from "@/lib/types";
import { getManifestData, setManifestData } from "@/utils/manifestCookies";
import { getBufferData, setBufferData } from "@/utils/bufferCookies";
import { addPinkData, deletePinkData, swapPinkData, getPinkDataArray } from "@/utils/pinkDataHelper";
import { getPinkData, setPinkData } from "@/utils/pinkCookies";
import { addLog } from "@/utils/logCookies";

//TODO: needa handle how to handle buffer
// buffer coords are (row, -col)
// 1. Add operation.type === 'buffer'
// 2. buffer operation type essentially is a move operation, except it needs to search index on the manifestData AND bufferData
//  - BufferData's data format will still be the same as manifestData(row, -col)
//  - When column data is negative, it implicitly implies to search in bufferData
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

  // Parse Pink data
  const pinkData = getPinkDataArray();

  // handle buffer
  if (operation.type === "buffer") {
    console.log("Handling buffer operation: ", operation);

    // find source (then copy from source and and set item/weight to UNUSED and 0)
    const isOldInPink = (operation.oldRow === 9 && operation.oldColumn === 1) || (operation.oldRow === 5 && operation.oldColumn === -1);
    const isNewInPink = (operation.newRow === 9 && operation.newColumn === 1) || (operation.newRow === 5 && operation.newColumn === -1);

    const isOldInBuffer = operation.oldColumn < 0;
    const isNewInBuffer = operation.newColumn < 0;

    let container = null;
    // check source in buffer
    if (isOldInBuffer) {
      if (isOldInPink) {
        container = pinkData[0];
        console.log("AHSFJAHSFJ", container);
      } else
      {const index = bufferData.findIndex(
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
      }}
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
        if (isNewInPink) {
          pinkData[0] = {
            row: operation.newRow,
            col: operation.newColumn,
            weight: container.weight,
            item: container.item,
            originalLine: `[${operation.newRow.toString().padStart(2, "0")},${operation.newColumn.toString().padStart(2, "0")}], {${container.weight.toString().padStart(5, "0")}}, ${container.item}`,
          };
      } else
        {const newIndex = bufferData.findIndex(
          (entry) =>
            entry &&
            entry.row === operation.newRow &&
            entry.col === -operation.newColumn &&
            entry.item === "UNUSED"
        );

        if (!bufferData[newIndex]) return;

        if (newIndex !== -1) {
          // this will update the new location with the container ("swapping locations")
          bufferData[newIndex].weight = container.weight;
          bufferData[newIndex].item = container.item;
        }}
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
          // this will update the new location with the container ("swapping locations")
          manifestData[newIndex].weight = container.weight;
          manifestData[newIndex].item = container.item;
        }
      }
    }
  }
  // Handle "move" operation
  else if (operation.type === "move" && operation.name !== "crane") {
    const isOldInPink = (operation.oldRow === 9 && operation.oldColumn === 1) || (operation.oldRow === 5 && operation.oldColumn === -1);
    const isNewInPink = (operation.newRow === 9 && operation.newColumn === 1) || (operation.newRow === 5 && operation.newColumn === -1);

    let container = null;

    // If moving from Pink to Pink
    if (isOldInPink && isNewInPink) {
      // Find the container in pinkData at the old location
      console.log("Moving from Pink to Pink", pinkData);
      swapPinkData();
    }

    // Find source container
    else if (isOldInPink) {
      // Source is in Pink slot
      const index = pinkData.findIndex(
        (entry) =>
          entry &&
          entry.row === operation.oldRow &&
          entry.col === operation.oldColumn &&
          entry.item !== "UNUSED" &&
          entry.item !== "NAN"
      );

      if (index !== -1) {
        container = { ...pinkData[index] };
        // Remove container from pinkData
        pinkData[index].weight = 0;
        pinkData[index].item = "UNUSED";
      } else {
        console.log("Error: Container not found in Pink slot");
        return;
      }
    } else {
      // Source is in manifestData
      const index = manifestData.findIndex(
        (entry) =>
          entry &&
          entry.row === operation.oldRow &&
          entry.col === operation.oldColumn &&
          entry.item !== "UNUSED" &&
          entry.item !== "NAN"
      );

      if (index !== -1) {
        container = { ...manifestData[index] };
        // Remove container from manifestData
        manifestData[index].weight = 0;
        manifestData[index].item = "UNUSED";
      } else {
        console.log("Error: Container not found in manifestData");
        return;
      }
    }

    // Place container into destination
    if (isNewInPink) {
      // Add new entry to pinkData
      pinkData[0] = {
        row: operation.newRow,
        col: operation.newColumn,
        weight: pinkData[0]?.weight || container?.weight || 0,
        item: pinkData[0]?.item || container?.item || "",
        originalLine: `[${operation.newRow
          .toString()
          .padStart(2, "0")},${operation.newColumn
            .toString()
            .padStart(2, "0")}], {${container?.weight || 0
              .toString()
              .padStart(5, "0")}}, ${container?.item}`,
      };
      console.log("Adding new entry to PinkData", pinkData);
    } else {
      // Destination is in manifestData
      const index = manifestData.findIndex(
        (entry) =>
          entry &&
          entry.row === operation.newRow &&
          entry.col === operation.newColumn &&
          entry.item === "UNUSED"
      );

      if (index !== -1) {
        // Place container into manifestData
        manifestData[index].weight = container.weight;
        manifestData[index].item = container.item;
      } else {
        console.log("Error: Destination slot in manifestData is not available");
        return;
      }
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
      weight: operation.weight ? operation.weight : 0,
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
      // if location already exists then something is wrong
      manifestData[index] = newEntry;
      console.log(
        "Yayyy Updated existing location with new container:",
        manifestData[index],
      );
    } else {
      // if location already exists then something is wrong
      console.log(
        "Error: Tried to onload container into location that's already occupied or can't be moved to",
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

  // Return updated Pink data
  const updatedPinkLines = pinkData
    .filter((entry) => entry)
    .map((entry) => {
      return `[${entry?.row.toString().padStart(2, "0")},${entry?.col
        .toString()
        .padStart(2, "0")}], {${entry?.weight
          .toString()
          .padStart(5, "0")}}, ${entry?.item}`;
    })
    .join("\n");
  console.log("UpdatedPinkData", updatedPinkLines);

  // Update cookies
  setManifestData(updatedManifestLines);
  setBufferData(updatedBufferLines); //TODO
  setPinkData(updatedPinkLines);
}
