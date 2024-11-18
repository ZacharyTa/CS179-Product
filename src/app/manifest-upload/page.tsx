"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import ManifestUpload from "@/components/ManifestUpload";

export default function UploadPage() {
  const router = useRouter();

  const handleManifestUpload = (manifestText: string) => {
    const savedManifestText = Cookies.set("manifestText", manifestText);
    if (savedManifestText) {
      router.push("/selection");
    }
  };
  return (
    <div className="h-screen flex items-center justify-center text-4xl bg-base-100">
      <div className="flex flex-col text-center rounded-md p-10 bg-base-content">
        <h1 className="text-white">Upload Manifest File</h1>
        <ManifestUpload onManifestUpload={handleManifestUpload} />
      </div>
    </div>
  );
}
