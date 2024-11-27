// OperationList.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import OperationCard from "./OperationCard";
import { OutputLoadOperation } from "@/lib/types";
import { getManifestData, getManifestFileName } from "@/utils/manifestCookies";
import { getBufferData } from "@/utils/bufferCookies";
import {
  getCurrentOperationIndex,
  setCurrentOperationIndex,
} from "@/utils/operationCookies";
import FinishModal from "@/components/FinishModal";
import { removeAllCookies } from "@/utils/removeAllCookies";
import { useRouter } from "next/navigation";
import { getSelection } from "@/utils/selectionCookies";
import { addLog } from "@/utils/logCookies";

interface OperationListProps {
  operations: OutputLoadOperation[];
  updateManifestText: (newManifestText: string) => void;
  updateBufferText?: (newBufferText: string) => void;
  onRemoveOperation?: (operationName: string) => void;
  loading: boolean;
  updateCurrentOperationIndex: (index: number) => void;
}

const OperationList: React.FC<OperationListProps> = ({
  operations,
  updateManifestText,
  updateBufferText,
  onRemoveOperation,
  loading,
  updateCurrentOperationIndex,
}) => {
  const [currentIndex, setCurrentIndex] = useState(getCurrentOperationIndex());
  const cardRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < operations.length) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(currentIndex + 1);
      setCurrentOperationIndex(newIndex);
      updateManifestText(getManifestData());
      if (updateBufferText) updateBufferText(getBufferData());
      updateCurrentOperationIndex(newIndex);
    }
  };

  const handleDownload = () => {
    const manifestText = getManifestData();
    const manifestFileName = getManifestFileName();
    const outboundFileName = manifestFileName.replace(".txt", "OUTBOUND.txt");

    const blob = new Blob([manifestText], { type: "text/plain" });
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.download = outboundFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDone = () => {
    // clear all cookies
    removeAllCookies();
    setIsFinishModalOpen(false);
    router.push("/manifest-upload");
  };

  const handleFinish = () => {
    const selection = getSelection();
    if (selection === "balancing")
      addLog(
        `Finished Balancing. Reminder Pop-up to download and send Manifest ${getManifestFileName().concat("OUTBOUND.txt")} to captain was displayed.`,
      );
    else if (selection === "loading")
      addLog(
        `Finished Loading/Unloading. Reminder Pop-up to download and send Manifest ${getManifestFileName().concat("OUTBOUND.txt")} to captain was displayed.`,
      );
    setIsFinishModalOpen(true);
  };

  const remaininTime = useMemo(() => {
    return operations
      .slice(currentIndex)
      .reduce((total, op) => total + (op.time || 0), 0);
  }, [operations, currentIndex]);

  useEffect(() => {
    const currentCard = cardRef.current[currentIndex];
    if (currentCard) {
      currentCard.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentIndex]);

  return (
    <div className="operation-list-container relative">
      {!loading && (
        <div className="remaining-time sticky top-0 bg-gray-800 rounded-md text-center z-10 shadow-lg">
          <p className="text-white">Estimated Remaining Time:</p>
          <p className="text-white font-semibold"> {remaininTime} Minutes</p>
          <p className="text-white mt-4">
            Moves: {Math.min(currentIndex + 1, operations.length)} /{" "}
            {operations.length}
          </p>
        </div>
      )}
      <div
        id="operation-list"
        className="carousel carousel-vertical h-full overflow-y-auto snap-y snap-mandatory gap-4"
      >
        {/* Dummy card at the beginning */}
        <div
          className="carousel-item w-full snap-center opacity-0"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "15vh",
          }}
        >
          <div className="card"></div>
        </div>

        {operations.map((operation, index) => (
          <div
            key={index}
            ref={(element) => {
              cardRef.current[index] = element;
            }}
            className={`carousel-item w-full snap-center ${
              index === currentIndex || loading ? "opacity-100" : "opacity-50"
            }`}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <OperationCard
              operation={operation}
              showNextButton={index === currentIndex}
              onNext={() => handleNext()}
              loading={loading}
              onRemove={() =>
                onRemoveOperation && onRemoveOperation(operation.name)
              }
            />
          </div>
        ))}

        {/* Dummy card at the end */}
        {currentIndex < operations.length && (
          <div
            className="carousel-item w-full snap-center opacity-0"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "25vh",
            }}
          >
            <div className="card"></div>
          </div>
        )}
        {/* finished button */}
        {!loading && currentIndex >= operations.length && (
          <div className="flex justify-center mt-4">
            <button className="btn btn-primary" onClick={handleFinish}>
              Finish
            </button>
          </div>
        )}
        <FinishModal
          title="Cargo Loading Complete"
          body="Please make sure to download and sent Manifest Outbound to captain before closing."
          isOpen={isFinishModalOpen}
          onDownload={handleDownload}
          onDone={handleDone}
        />
      </div>
    </div>
  );
};

export default OperationList;
