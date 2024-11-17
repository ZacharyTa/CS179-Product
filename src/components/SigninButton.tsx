import React from "react";
import { useRouter } from "next/navigation";

const SignInButton: React.FC = () => {
  const router = useRouter();

  const handleSignin = () => {
    router.push("/signin");
  };

  return (
    <button className="btn btn-outline btn-primary" onClick={handleSignin}>
      {" "}
      Sign In
    </button>
  );
};

export default SignInButton;
