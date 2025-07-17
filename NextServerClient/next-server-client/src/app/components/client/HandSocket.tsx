"use client";

import { useState, useEffect } from "react";
import { HandFull } from "@/app/serverUtils/getMostRecentHand";

export default function HandSocket({ initialHand }: { initialHand: HandFull }) {
  const [hand, setHand] = useState(initialHand);

  const fetchHand = async () => {
    const res = await fetch("/api/hand");
    if (res.ok) {
      const data = await res.json();
      setHand(data);
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

  const heroCards = hand.players.find((p) => p.isHero)?.cards;

  return (
    <div>
      <h1>Hand: #{hand.pokerClientHandId}</h1>
      <h2>
        Hand: {heroCards?.card1} {heroCards?.card2}
      </h2>
      <h2>
        Community Cards: {hand.communityCards?.flop1 || ""}{" "}
        {hand.communityCards?.flop2 || ""} {hand.communityCards?.flop3 || ""}{" "}
        {hand.communityCards?.turn || ""} {hand.communityCards?.river || ""}
      </h2>
      <pre>
        <code>{JSON.stringify(hand, null, 2)}</code>
      </pre>
    </div>
  );
}
