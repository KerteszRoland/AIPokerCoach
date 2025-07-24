"use client";
import Button from "./Button";
import { signIn } from "next-auth/react";

export default function SignInButton() {
  return <Button onClick={() => signIn("google")}>Sign in</Button>;
}
