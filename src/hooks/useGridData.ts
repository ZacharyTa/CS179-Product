// Transform ManifestData format into Grid data form

// Container {
//  item: string;
//   location: { row: number; col: number };
//   weight: number;
// }

import { useState, useEffect } from 'react';
import { Container } from '@/lib/types'

interface useGridDataProps {
    containers: Container[];
    columns: number,
    rows: number;
}

export function useGridData({containers, columns, rows}: useGridDataProps) {
    // this hook will handle abilities:
    //    Update/Set grid containers when users upload manifest
    //    Update grid containers when users select slots on the grid (idk maybe use a separate list/set)

    const [gridSlots, setGridSlots] = useState<(Container | null)[]>([]);
    const [selectedGridSlots, setSelectedGridSlots] = useState<Set<number>>(new Set());

    // if grid updates size (size varies bc it can be the buffer zone grid or ship grid)
    // or if grid update contents (select ability, manifest update from balance/loading operations)
    useEffect(() => {
        const gridSize = rows * columns;
        const grid: (Container | null)[] = Array(gridSize).fill(null)

        containers.forEach((container) => {
            const rowIndex = container.location.row - 1;
            const colIndex = container.location.col - 1;
            const index = (rowIndex * columns) + colIndex

            // error check: check within bounds, then add to grid
            if (index >= 0 && index < gridSize) {
                grid[gridSize - index - 1] = {...container, index};
            }
        })

        setGridSlots(grid);
    }, [containers, columns, rows])


    // handle selecting grid slots
    const selectGridSlot = (index: number) => {
        setSelectedGridSlots((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(index)) {
                newSelected.delete(index);
            }
            else {
                newSelected.add(index);
            }
            return newSelected;
        });
    };
    return {gridSlots, selectedGridSlots, selectGridSlot }
}

