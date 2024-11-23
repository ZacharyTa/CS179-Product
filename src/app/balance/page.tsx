"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ShipGrid from "@/components/ShipGrid";
import BufferGrid from "@/components/BufferGrid";
import useManifestData from "@/hooks/useManifestData";
import useBufferData from "@/hooks/useBufferData";
// import SignInButton from "@/components/SigninButton";
// import MessageModal from "@/components/MessageModal";
import OperationList from "@/components/OperationList";
import { getOperations, setOperations } from "@/utils/operationCookies";
import { getBufferData } from "@/utils/bufferCookies";
import { OutputLoadOperation } from "@/lib/types";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { getManifestData } from "@/utils/manifestCookies";

export default function BalancePage() {
  const [manifestText, setManifestText] = useState<string>("");
  const [bufferText, setBufferText] = useState<string>(""); // TODO: make these grab from cookies
  // const [isMessageModalOpen, setIsMessageModalOpen] = useState<boolean>(false);
  // const [isCargoLoadModalOpen, setIsCargoLoadModalOpen] =
  useState<boolean>(false);
  const [operations, setOperationsState] = useState<OutputLoadOperation[]>([
    {
      type: "move",
      name: "Ram",
      time: 3,
      oldRow: 1,
      oldColumn: 4,
      newRow: 4,
      newColumn: 1,
    },
    {
      type: "move",
      name: "Dog",
      time: 3,
      oldRow: 2,
      oldColumn: 2,
      newRow: 5,
      newColumn: 1,
    },
    {
      type: "offload",
      name: "Owl",
      time: 3,
      oldRow: 1,
      oldColumn: 9,
      newRow: 0,
      newColumn: 0,
    },
    {
      type: "onload",
      name: "Top",
      time: 3,
      oldRow: 0,
      oldColumn: 0,
      newRow: 6,
      newColumn: 1,
    },
    {
      type: "buffer",
      name: "Top",
      time: 3,
      oldRow: 6,
      oldColumn: 1,
      newRow: 1,
      newColumn: -1,
    },
    {
      type: "buffer",
      name: "Top",
      time: 3,
      oldRow: 1,
      oldColumn: -1,
      newRow: 1,
      newColumn: -24,
    },
    {
      type: "buffer",
      name: "Top",
      time: 3,
      oldRow: 1,
      oldColumn: -24,
      newRow: 6,
      newColumn: 1,
    },
    // Add more operations as needed
  ]);

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

  useEffect(() => {
    // saved changed operations to cookies (future use when we grab the list of operations from handleBalancing)
    setOperations(operations);
    setOperationsState(operations);
  }, [operations]);

  const updateManifestText = (newManifestText: string) => {
    setManifestText(newManifestText);
  };

  const updateBufferText = (newBufferText: string) => {
    setBufferText(newBufferText);
  };

  // const handleOpenMessageModal = () => {
  //   setIsMessageModalOpen(true);
  // };

  // const handleCloseMessageModal = () => {
  //   setIsMessageModalOpen(false);
  // };

  return (
    <Layout
      sidebar={
        <OperationList
          operations={operations}
          updateManifestText={updateManifestText}
          updateBufferText={updateBufferText}
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
