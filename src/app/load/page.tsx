"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ShipGrid from "@/components/ShipGrid";
import useManifestData from "@/hooks/useManifestData";
import OperationList from "@/components/OperationList";
import { getOperations, setOperations } from "@/utils/operationCookies";
import { OutputLoadOperation, Container } from "@/lib/types";
import { getManifestData } from "@/utils/manifestCookies";
import { useRouter } from "next/navigation";
import handleLoading from "@/utils/handleLoading";
import Log from "@/components/Log";
import { setSelection } from "@/utils/selectionCookies";

export default function LoadPage() {
  const router = useRouter();
  const [manifestText, setManifestText] = useState<string>("");
  const [operations, setOperationsState] = useState<OutputLoadOperation[]>([]);

  // onmount load manifestText and operations
  useEffect(() => {
    const savedManifestText = getManifestData();
    if (savedManifestText) {
      setManifestText(savedManifestText);
    }
    const savedOperations = getOperations();
    if (savedOperations.length > 0) {
      setOperationsState(savedOperations);
    }
  }, []);

  const manifestData = useManifestData(manifestText);

  const updateManifestText = (newManifestText: string) => {
    setManifestText(newManifestText);
  };

  const handleOffload = (container: Container) => {
    const existingOperationIndex = operations.findIndex(
      (op) =>
        op.type === "offload" &&
        op.oldRow === container.location.row &&
        op.oldColumn === container.location.col,
    );

    let updatedOperations = [...operations];

    if (existingOperationIndex !== -1) {
      updatedOperations.splice(existingOperationIndex, 1);
    } else {
      const newOperation: OutputLoadOperation = {
        type: "offload",
        name: container.item,
        time: 0,
        oldRow: container.location.row,
        oldColumn: container.location.col,
        newRow: 0,
        newColumn: 0,
      };
      updatedOperations.push(newOperation);
    }
    setOperations(updatedOperations);
    setOperationsState(updatedOperations);
  };

  const handleOnload = () => {
    const name = prompt("Enter cargo name:");
    if (!name) {
      alert("Invalid name");
      return;
    }

    let weight = prompt("Enter cargo's weight/mass(kg) (optional):");
    if (!weight) {
      weight = "0";
    }

    const operation: OutputLoadOperation = {
      type: "onload",
      name: name,
      time: 0,
      oldRow: 0,
      oldColumn: 0,
      newRow: 0,
      newColumn: 0,
      weight: parseInt(weight, 10),
    };

    const updatedOperations = [...operations, operation]; // Shallow copy just in case for race condition
    setOperations(updatedOperations);
    setOperationsState(updatedOperations);
  };

  const handleFinish = () => {
    setSelection("loading");
    const optimalOperations = handleLoading(getManifestData(), operations);
    setOperations(optimalOperations);

    router.push("/balance");
  };

  const handleRemoveOperation = (operationName: string) => {
    const updatedOperations = operations.filter(
      (operation) => operation.name !== operationName,
    );
    setOperationsState(updatedOperations);
    setOperations(updatedOperations);
  };

  const onSelectContainer = (container: Container) => {
    handleOffload(container);
  };

  return (
    <Layout
      sidebar={
        <OperationList
          operations={operations}
          updateManifestText={updateManifestText}
          loading={true}
          onRemoveOperation={handleRemoveOperation}
        />
      }
    >
      <div className="h-full outline outline-red-500">
        <div className="grid grid-flow-col grid-cols-4 grid-rows-5 gap-4 outline outline-red-500">
          <div className="col-span-2 row-span-3 row-start-2 outline outline-red-500">
            {manifestData && (
              <ShipGrid
                columns={manifestData.columns}
                rows={manifestData.rows}
                containers={manifestData.containers}
                loading={true}
                operations={operations}
                onSelectContainer={onSelectContainer}
              />
            )}
          </div>
          <div className="col-span-3 col-start-1 row-start-5 outline outline-red-500">
            <div className="flex flex-row items-center gap-2">
              <div className="flex-1">
                <Log />
              </div>
              <div className="flex-3 flex flex-col gap-2 justify-between">
                <button className="btn btn-secondary" onClick={handleOnload}>
                  Add Cargo
                </button>
                <button className="btn btn-primary" onClick={handleFinish}>
                  Finish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
