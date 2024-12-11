"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import handleBalancing from "@/utils/handleBalancing";
import { getManifestData } from "@/utils/manifestCookies";
import { setOperations } from "@/utils/operationCookies";
import { setSelection } from "@/utils/selectionCookies";
import Layout from "@/components/Layout";

export default function SelectionPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const handleBalance = () => {
    setIsLoading(true);
    setTimeout(() => {
      const optimalOperations = handleBalancing(getManifestData());
      setSelection("balancing");

      setOperations(optimalOperations);

      router.push("/balance");
      setIsLoading(true);
    }, 500);
  };

  return (
    <Layout>
      <div className="h-screen flex items-center justify-center text-4xl bg-base-100">
        {!isLoading && (
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
                onClick={handleBalance}
              >
                Balance Ship
              </button>
            </div>
          </div>
        )}
        {isLoading && (
          <span className="loading loading-spinner loading-lg text-primary"></span>
        )}
      </div>
    </Layout>
  );
}
