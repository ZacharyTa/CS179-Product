// OperationCard.tsx
import React from "react";
import { OutputLoadOperation } from "@/lib/types";
import { getManifestData, setManifestData } from "@/utils/manifestCookies";
import applyOperationToManifest from "@/utils/manifestOperations";

interface OperationCardProps {
  operation: OutputLoadOperation;
  showNextButton?: boolean;
  onNext: (newManifestText: string) => void;
}

const OperationCard: React.FC<OperationCardProps> = ({
  operation,
  showNextButton = false,
  onNext,
}) => {
  const { type, name, oldRow, oldColumn, newRow, newColumn } = operation;

  const handleNext = () => {
    //get current manifest data
    let manifestText = getManifestData();

    // apply operation on manifes data
    manifestText = applyOperationToManifest(manifestText, operation)!;

    // save new manifest data to cookies
    setManifestData(manifestText);

    // move to next operation card
    onNext(manifestText);
  };

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
            <button className="btn btn-primary" onClick={handleNext}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationCard;
