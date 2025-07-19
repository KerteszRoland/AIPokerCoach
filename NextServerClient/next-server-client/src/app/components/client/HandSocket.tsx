"use client";

import { HandFull } from "@/app/serverUtils/serverRequests/hand";
import { useRecentHandViaSocket } from "@/app/hooks/useRecentHandViaSocket";

export default function HandSocket({ initialHand }: { initialHand: HandFull }) {
  const { hand } = useRecentHandViaSocket({ initialHand });

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
