"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ShipGrid from "@/components/ShipGrid";
import BufferGrid from "@/components/BufferGrid";
import useManifestData from "@/hooks/useManifestData";
import useBufferData from "@/hooks/useBufferData";
import OperationList from "@/components/OperationList";
import { getOperations, setOperations } from "@/utils/operationCookies";
import { getBufferData } from "@/utils/bufferCookies";
import { OutputLoadOperation } from "@/lib/types";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getManifestData } from "@/utils/manifestCookies";

export default function BalancePage() {
  const [manifestText, setManifestText] = useState<string>("");
  const [bufferText, setBufferText] = useState<string>(""); // TODO: make these grab from cookies
  const [operations, setOperationsState] = useState<OutputLoadOperation[]>([]);

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

  return (
    <Layout
      sidebar={
        <OperationList
          operations={operations}
          updateManifestText={updateManifestText}
          updateBufferText={updateBufferText}
          loading={false}
        />
      }
    >
      <TransformWrapper limitToBounds={false} minScale={0.5} maxScale={2}>
        <TransformComponent>
          <div className="h-full outline outline-red-500">
            <div className="grid grid-cols-7 grid-rows-8 gap-4 outline outline-red-500">
              <div className="col-span-2 row-span-3 col-start-6 row-start-6 outline outline-red-500">
                {manifestData && (
                  <ShipGrid
                    columns={manifestData.columns}
                    rows={manifestData.rows}
                    containers={manifestData.containers}
                    loading={false}
                  />
                )}
              </div>
              <div className="col-span-4 row-span-2 col-start-1 row-start-6 outline outline-red-500">
                {bufferData && (
                  <BufferGrid
                    columns={bufferData.columns}
                    rows={bufferData.rows}
                    containers={bufferData.containers}
                  />
                )}
              </div>
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </Layout>
  );
}
