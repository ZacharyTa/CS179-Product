"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ShipGrid from "@/components/ShipGrid";
import BufferGrid from "@/components/BufferGrid";
import useManifestData from "@/hooks/useManifestData";
import useBufferData from "@/hooks/useBufferData";
import OperationList from "@/components/OperationList";
import {
  getOperations,
  setOperations,
  getCurrentOperation,
  setCurrentOperationIndex,
  getCurrentOperationIndex,
} from "@/utils/operationCookies";
import { getBufferData } from "@/utils/bufferCookies";
import { OutputLoadOperation } from "@/lib/types";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getManifestData } from "@/utils/manifestCookies";
import Image from "next/image";
import Log from "@/components/Log";

export default function BalancePage() {
  const [manifestText, setManifestText] = useState<string>("");
  const [bufferText, setBufferText] = useState<string>(""); // TODO: make these grab from cookies
  const [operations, setOperationsState] = useState<OutputLoadOperation[]>([]);
  const [currentOperationIndex, setCurrentOperationIndexState] =
    useState<number>(getCurrentOperationIndex());

  // onmount load manifestText and operations
  useEffect(() => {
    const savedManifestText = getManifestData();
    if (savedManifestText) {
      setManifestText(savedManifestText);
    }
    const savedBufferText = getBufferData();
    if (savedBufferText) {
      setBufferText(savedBufferText);
    }
    const savedOperations = getOperations();
    if (savedOperations.length > 0) {
      setOperationsState(savedOperations);
    }
  }, []);

  const manifestData = useManifestData(manifestText);
  const bufferData = useBufferData(bufferText);

  const updateManifestText = (newManifestText: string) => {
    setManifestText(newManifestText);
  };

  const updateBufferText = (newBufferText: string) => {
    setBufferText(newBufferText);
  };

  const updateCurrentOperationIndex = (newIndex: number) => {
    setCurrentOperationIndexState(newIndex);
  };

  const currentOperation = getCurrentOperation();
  let imageOutlineClass = "";
  if (currentOperation) {
    const { oldRow, oldColumn, newRow, newColumn } = currentOperation;
    if (oldRow == 0 && oldColumn == 0) {
      imageOutlineClass =
        "outline outline-dashed outline-yellow-300 outline-offset-1";
    } else if (newRow == 0 && newColumn == 0) {
      imageOutlineClass =
        "outline outline-dashed outline-green-300 outline-offset-1";
    }
  }

  return (
    <div>
      <Layout
        sidebar={
          <OperationList
            operations={operations}
            updateManifestText={updateManifestText}
            updateBufferText={updateBufferText}
            updateCurrentOperationIndex={updateCurrentOperationIndex}
            loading={false}
          />
        }
      >
        <TransformWrapper limitToBounds={false} minScale={0.5} maxScale={2}>
          <TransformComponent>
            <div className="h-full/2 ">
              <div className="grid grid-cols-7 grid-rows-8 gap-4">
                <div className="col-span-2 row-span-3 col-start-6 row-start-6">
                  {manifestData && (
                    <ShipGrid
                      columns={manifestData.columns}
                      rows={manifestData.rows}
                      containers={manifestData.containers}
                      loading={false}
                      currentOperationIndex={currentOperationIndex}
                    />
                  )}
                </div>
                <div className="col-span-4 row-span-2 col-start-1 row-start-6">
                  {bufferData && (
                    <BufferGrid
                      columns={bufferData.columns}
                      rows={bufferData.rows}
                      containers={bufferData.containers}
                      currentOperationIndex={currentOperationIndex}
                      loading={false}
                    />
                  )}
                </div>
                <div className="col-span-1 row-span-1 col-start-5 row-start-7">
                  <div className="flex justify-center">
                    <Image
                      src="/assets/truck.png"
                      alt="truck"
                      width={100}
                      height={100}
                      className={imageOutlineClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TransformComponent>
        </TransformWrapper>
      </Layout>
      <div className="grid grid-cols-5">
        <div className="col-span-3 col-start-1">
          <Log />
        </div>
      </div>
    </div>
  );
}
