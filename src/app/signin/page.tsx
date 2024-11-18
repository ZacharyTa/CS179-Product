"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");

  const handleSignIn = () => {
    if (name?.toLocaleLowerCase() === "zachary") router.push("/selection");
  };

  return (
    <div className="h-screen flex items-center justify-center text-4xl bg-base-100">
      <div className="flex-col text-start space-y-4 outline outline-2 rounded-md p-10 bg-base-content">
        <p className="text-center">Sign In</p>
        <label className="input input-bordered flex items-center gap-2 text-black">
          Name
          <input
            type="text"
            className="grow"
            placeholder="John"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <div className="flex justify-center">
          <button
            className="btn btn-outline btn-primary"
            onClick={handleSignIn}
          >
            {" "}
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
