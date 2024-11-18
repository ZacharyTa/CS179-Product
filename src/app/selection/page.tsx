"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function SelectionPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex items-center justify-center text-4xl bg-base-100">
      <div className="flex-col text-start space-y-4 outline outline-2 rounded-md p-10 bg-base-content">
        <h1 className="text-center">Select Operation</h1>
        <div className="flex flex-row gap-4">
          <button
            className="btn btn-primary btn-outline btn-lg"
            onClick={() => router.push("/load")}
          >
            Onload/Offload <br /> Cargo
          </button>
          <button
            className="btn btn-secondary btn-outline btn-lg"
            onClick={() => router.push("/balance")}
          >
            Balance Ship
          </button>
        </div>
      </div>
    </div>
  );
}
