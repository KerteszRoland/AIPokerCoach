"use client";

import { useState, useEffect } from "react";
import { HandFull } from "@/app/serverUtils/serverRequests/hand";

export function useRecentHandViaSocket({
  initialHand,
}: {
  initialHand: HandFull | null;
}) {
  const [hand, setHand] = useState<HandFull | null>(initialHand);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHand = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hand/recent");
      if (res.ok) {
        const data = await res.json();
        setHand(data);
      }
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const eventSource = new EventSource("/api/events");
    eventSource.onmessage = (event) => {
      try {
        console.log("event.data", event.data);
        const msg = JSON.parse(event.data);
        if (msg.type === "new-hand") {
          fetchHand();
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

  return { hand, fetchHand, loading, error };
}
