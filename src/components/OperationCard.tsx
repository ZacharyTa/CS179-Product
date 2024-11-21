// OperationCard.tsx
import React from "react";
import { OutputLoadOperation } from "@/lib/types";

interface OperationCardProps {
  operation: OutputLoadOperation;
  showNextButton?: boolean;
  onNext?: () => void;
}

const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  showNextButton = false,
  onNext,
}) => {
  const { type, name, oldRow, oldColumn, newRow, newColumn } = operation;

  return (
    <div className="card w-full bg-base-100 shadow-md">
      <div className="card-body">
        <h2 className="card-title text-base-content">{`${type.toUpperCase()} - ${name}`}</h2>
        <p className="text-base-content">Crate: {name}</p>
        <p className="text-base-content">
          Source:{" "}
          {type === "onload" ? "N/A" : `[Row ${oldRow}, Col ${oldColumn}]`}
        </p>
        <p className="text-base-content">
          Destination:{" "}
          {type === "offload" ? "N/A" : `[Row ${newRow}, Col ${newColumn}]`}
        </p>
        {showNextButton && (
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={onNext}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationCard;
