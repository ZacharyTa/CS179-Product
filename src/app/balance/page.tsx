"use client";
import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ShipGrid from "@/components/ShipGrid";
import useManifestData from "@/hooks/useManifestData";
import SignInButton from "@/components/SigninButton";
import MessageModal from "@/components/MessageModal";
import Cookies from "js-cookie";
import OperationList from "@/components/OperationList";
import { OutputLoadOperation } from "@/lib/types";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function BalancePage() {
  const [manifestText, setManifestText] = useState<string>("");
  const [isMessageModalOpen, setIsMessageModalOpen] = useState<boolean>(false);
  const [isCargoLoadModalOpen, setIsCargoLoadModalOpen] =
    useState<boolean>(false);
  const operations: OutputLoadOperation[] = [
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
    // Add more operations as needed
  ];

  useEffect(() => {
    const savedManifestText = Cookies.get("manifestText");
    if (savedManifestText) {
      setManifestText(savedManifestText);
    }
  }, []);

  const manifestData = useManifestData(manifestText);

  const updateManifestText = (newManifestText: string) => {
    console.log("SDASDASD");
    setManifestText(newManifestText);
  };

  const handleOpenMessageModal = () => {
    setIsMessageModalOpen(true);
  };

  const handleCloseMessageModal = () => {
    setIsMessageModalOpen(false);
  };

  return (
    <Layout
      sidebar={
        <OperationList
          operations={operations}
          updateManifestText={updateManifestText}
        />
      }
    >
      <TransformWrapper limitToBounds={false} minScale={0.5} maxScale={1}>
        <TransformComponent>
          <div className="h-full outline outline-red-500">
            <div className="grid grid-cols-6 grid-rows-4 gap-4 outline outline-red-500">
              <div className="col-span-3 row-span-3 col-start-4 row-start-2 outline outline-red-500">
                {manifestData && (
                  <ShipGrid
                    columns={manifestData.columns}
                    rows={manifestData.rows}
                    containers={manifestData.containers}
                  />
                )}
              </div>
              <div className="col-span-3 row-span-2 col-start-1 row-start-2 outline outline-red-500">
                15
              </div>
              <div className="col-span-3 row-start-4 outline outline-red-500">
                20
              </div>
            </div>
          </div>
        </TransformComponent>
      </TransformWrapper>
    </Layout>
  );
}
