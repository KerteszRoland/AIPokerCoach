"use client";

import { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
export default function RustClientCallbackPageClient({
  accessToken,
}: {
  accessToken: string;
}) {
  useEffect(() => {
    window.open(`ai-poker-coach://callback?token=${accessToken}`, "_blank");
  }, []);
  return (
    <div className="flex items-center justify-center gap-2">
      <div>
        <FaCheckCircle className="text-green-500 text-4xl" />
      </div>
      <span className="text-2xl">Successfully logged in to desktop client</span>
    </div>
  );
}
