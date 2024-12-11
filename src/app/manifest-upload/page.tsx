"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import ManifestUpload from "@/components/ManifestUpload";
import Layout from "@/components/Layout";
import { removeAllCookies } from "@/utils/removeAllCookies";
import bufferEmpty from "@/data/buffer";
import { countContainers } from "@/utils/manifestText";
import { addLog } from "@/utils/logCookies";

export default function UploadPage() {
  const router = useRouter();
  removeAllCookies();

  const handleManifestUpload = (manifestText: string, fileName: string) => {
    const numContainers = countContainers(manifestText);
    // Gotta get manifestFilename passsed up from ManifestUpload child component due to race condition
    addLog(
      `Manifest ${fileName} is opened, there are ${numContainers} containers on the ship.`,
    );

    const savedManifestText = Cookies.set("manifestText", manifestText);
    Cookies.set("bufferText", bufferEmpty.trim());
    if (savedManifestText) {
      router.push("/selection");
    }
  };
  return (
    <Layout>
      <div className="h-screen flex items-center justify-center text-4xl bg-base-100">
        <div className="flex flex-col text-center rounded-md p-10 bg-base-content">
          <h1 className="text-white">Upload Manifest File</h1>
          <ManifestUpload onManifestUpload={handleManifestUpload} />
        </div>
      </div>
    </Layout>
  );
}
