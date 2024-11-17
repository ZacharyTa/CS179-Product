// this will handle the manifest data, updating it should rerender components its mounted with whenver manifestData updates 
// (via uploading manifest file through file upload component using daisyui )

// [row, col], {weight}, item
// ...
// [08,12], {00000}, UNUSED
// [08,12], {00000}, UNUSED
// ....

// input: manifestText raw text data -> Useable data format
// perform some sort of simple data extraction algorithm

import { ManifestData, Container } from "@/lib/types"

export default function useManifestData(manifestText: string): ManifestData {
    // variables
    const maxRow = 8;
    const maxCol = 12;
    const containers: Container[] = [];

    const lines = manifestText.split("\n");
    if (manifestText) {
    for (const line of lines) {
        // [row, col], {weight}, item
        const data = line.split(",");

        if(data) {
            const row = parseInt(data[0].substring(1), 10);
            const col = parseInt(data[1].substring(0,2), 10);
            const weight = parseInt(data[2].substring(1,6), 10);
            const item = data[3].trim();

            containers.push({
                item,
                weight,
                location: {row, col}
            })
        }
    }
}


    return {containers, columns: maxCol, rows: maxRow}
}