// OperationCard.tsx
import React, { useState } from "react";
import { OutputLoadOperation } from "@/lib/types";
import { getManifestData, setManifestData } from "@/utils/manifestCookies";
import applyOperation from "@/utils/manifestOperations";
import { getOperations, setOperations } from "@/utils/operationCookies";

interface OperationCardProps {
  operation: OutputLoadOperation;
  showNextButton?: boolean;
  onNext: () => void;
  loading: boolean;
  onRemove: () => void; //Remove card (only for loading screen)
}

const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  showNextButton = false,
  onNext,
  loading,
  onRemove,
}) => {
  const { type, name, oldRow, oldColumn, newRow, newColumn } = operation;
  const [weight, setWeight] = useState<number | "">(operation.weight || 0);

  const handleNext = () => {
    if (type === "onload" && (typeof weight !== "number" || weight <= 0)) {
      alert("Please specify weight of the item before proceeding.");
      return;
    }

    if (type === "onload" && !loading) {
      operation.weight = weight ? weight : 0;
      handleOnload();
    }

    // apply operation on manifest/buffer data
    applyOperation(operation)!;

    // move to next operation card
    onNext();
  };

  const handleRemove = () => {
    const operations = getOperations();
    const updatedoperations = operations.filter(
      (op) => op.name !== operation.name,
    );
    setOperations(updatedoperations);
    onRemove(); // this lets the parent prop know a card has been removed and its time to rerender the operationlist
  };

  const handleOnload = () => {
    const manifestData = getManifestData().split("\n");
    const updatedManifestData = manifestData
      .map((line) => {
        if (line.includes(name)) {
          const parts = line.split(",");
          return parts.join(",");
        }
        return line;
      })
      .join("\n");

    setManifestData(updatedManifestData);
  };

  const showNextEnabled =
    type !== "onload" ||
    (type === "onload" &&
      typeof weight === "number" &&
      weight > 0 &&
      weight <= 99999);

  return (
    <div className="card w-full bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex flex-row justify-between">
          <h2 className="card-title text-base-content">{`${type.toUpperCase()}`}</h2>
          <button
            className="btn btn-circle btn-xs text-error"
            onClick={handleRemove}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p className="text-base-content">
          <span className="text-sm">Item: </span>
          <span className="text-lg font-bold italic">{name}</span>
        </p>
        {type === "onload" && !loading && (
          <div className="form-control">
            <label className="label">
              <span className="label-text">Weight:</span>
            </label>
            <input
              type="number"
              className="input input-bordered input-info text-base-content"
              placeholder="Weight of Cargo (kg)"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
          </div>
        )}
        <p className="text-base-content">
          <span className="text-sm">From: </span>
          <span className="text-lg font-bold">
            {type === "onload" ? "Truck" : `[${oldRow}, ${oldColumn}]`}
          </span>
        </p>
        <p className="text-base-content">
          <span className="text-sm">To: </span>
          <span className="text-lg font-bold">
            {type === "offload" ? "Truck" : `[${newRow}, ${newColumn}]`}
          </span>
        </p>
        {showNextButton && !loading && (
          <button
            className="btn btn-primary mt-4"
            onClick={handleNext}
            disabled={!showNextEnabled}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default OperationCard;
