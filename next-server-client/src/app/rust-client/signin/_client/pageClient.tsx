"use client";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function RustClientSignInPageClient() {
  useEffect(() => {
    signIn("google", {
      callbackUrl: "/rust-client/callback",
      redirect: true,
    });
  }, []);
  return <div className="text-2xl">Redirecting to sign in page...</div>;
}
