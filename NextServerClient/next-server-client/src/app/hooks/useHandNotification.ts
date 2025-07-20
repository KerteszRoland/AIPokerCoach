"use client";

import { useEffect } from "react";
import { HandNotification } from "../serverUtils/sse";

export function useHandNotification({
  onNewHand,
}: {
  onNewHand: (hand: HandNotification) => void;
}) {
  useEffect(() => {
    const eventSource = new EventSource("/api/events");
    eventSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as HandNotification;
        if (msg.type === "new-hand") {
          onNewHand(msg);
        }
      } catch (error) {
        console.error("Error parsing SSE message:", error);
      }
    };
    return () => {
      eventSource.close();
      console.log("eventSource closed");
    };
  }, []);
}
