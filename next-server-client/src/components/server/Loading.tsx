import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "@/assets/loading.json";

export default function Loading({ size = 50 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }}>
      <Lottie
        animationData={loadingAnimation}
        loop={true}
        autoplay={true}
        style={{ width: size }}
      />
    </div>
  );
}
