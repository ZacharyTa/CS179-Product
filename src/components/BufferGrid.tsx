"use client";
import React, { useState, useEffect } from "react";
import { Container } from "@/lib/types";
import { useGridData } from "@/hooks/useGridData";
import { getCurrentOperation } from "@/utils/operationCookies";
import { Target, Circle } from "lucide-react";

interface BufferGridProps {
  containers?: Container[];
  columns: number;
  rows: number;
  currentOperationIndex: number;
  loading: boolean;
}

const BufferGrid: React.FC<BufferGridProps> = ({
  containers = [],
  columns,
  rows,
  currentOperationIndex,
  loading,
}) => {
  const { gridSlots, selectedGridSlots, selectGridSlot } = useGridData({
    containers,
    columns,
    rows,
  });

  const [oldIndex, setOldIndex] = useState<number | null>(null);
  const [newIndex, setNewIndex] = useState<number | null>(null);

  useEffect(() => {
    const operation = getCurrentOperation();
    if (operation) {
      const { oldRow, oldColumn, newRow, newColumn } = operation;
      const gridSize = columns * rows;

      if (oldColumn < 0) {
        const oldIdx = (oldRow - 1) * columns + (-oldColumn - 1);
        setOldIndex(gridSize - oldIdx - 1);
      } else {
        setOldIndex(null);
      }

      if (newColumn < 0) {
        const newIdx = (newRow - 1) * columns + (-newColumn - 1);
        setNewIndex(gridSize - newIdx - 1);
      } else {
        setNewIndex(null);
      }
    } else {
      setOldIndex(null);
      setNewIndex(null);
    }
  }, [currentOperationIndex, columns, rows]);

  return (
    <>
      <div
        className="grid gap-1 bg-transparent"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
        dir="ltr"
      >
        {gridSlots?.map((slot, index) => {
          const isOld = index === oldIndex;
          const isNew = index === newIndex;
          const cellClass = isOld
            ? "outline outline-dashed outline-offset-1 outline-yellow-300"
            : isNew
              ? "outline outline-dashed outline-offset-1 outline-green-300"
              : "";
          return (
            <div
              key={index}
              className={`relative flex items-center justify-center text-center border aspect-square text-[12px] ${
                !loading ? cellClass : ""
              } ${
                slot
                  ? selectedGridSlots.has(index)
                    ? "bg-success"
                    : slot.item === "UNUSED"
                      ? "bg-secondary/50"
                      : slot.item === "NAN"
                        ? "bg-black text-white"
                        : "bg-base-300 text-base-content"
                  : "bg-white"
              } hover:opacity-70`}
              onClick={() => slot?.item !== "NAN" && selectGridSlot(index)}
            >
              <span className="truncate">{slot ? slot?.item : "Empty"}</span>
              {isNew && (
                <Target className="absolute w-12 h-12 animate-pulse text-error" />
              )}
              {isOld && (
                <Circle className="absolute w-12 h-12 animate-pulse text-warning" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};

export default BufferGrid;
