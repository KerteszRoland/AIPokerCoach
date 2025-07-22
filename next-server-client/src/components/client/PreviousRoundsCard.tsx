"use client";

import { getChartHandFromCards } from "@/config/chart";
import Card from "../server/Card";
import { Card as CardType } from "@/config/card";
import { useGetHands } from "@/hooks/useHands";
import { useEffect, useRef } from "react";
import { Position } from "@/config/position";

export default function PreviousRoundsCard() {
  const scrollableContentRef = useRef<HTMLDivElement>(null);
  const { data: hands } = useGetHands({
    page: 0,
    pageSize: 30,
  });

  useEffect(() => {
    if (scrollableContentRef.current) {
      scrollableContentRef.current.scrollTo({
        top: scrollableContentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [hands]);

  return (
    <Card
      Header={<div className="text-lg text-center">Previous Rounds</div>}
      scrollableContentMaxHeight={400}
    >
      <div
        className="flex flex-row gap-2 h-[500px] overflow-y-auto"
        ref={scrollableContentRef}
      >
        <div className="flex flex-col gap-2">
          {hands &&
            hands.map((hand) => {
              const hero = hand.players.find((player) => player.isHero);
              if (!hero || (hero && hero.position === null)) {
                return null;
              }
              const wonAmount = hero.chipsAfterHand - hero.chips;
              return (
                <PreviousRoundResult key={hand.id} wonAmount={wonAmount} />
              );
            })}
        </div>
        <div className="flex flex-col gap-2">
          {hands &&
            hands.map((hand) => {
              const hero = hand.players.find((player) => player.isHero);
              if (
                !hero ||
                (hero && (hero.position === null || hero.cards === null))
              ) {
                return null;
              }
              const heroCards = [hero.cards!.card1, hero.cards!.card2];
              return <PreviousRoundCards key={hand.id} cards={heroCards} />;
            })}
        </div>
        <div className="flex flex-col gap-2">
          {hands &&
            hands.map((hand) => {
              const hero = hand.players.find((player) => player.isHero);
              if (!hero || (hero && hero.position === null)) {
                return null;
              }
              return (
                <PreviousRoundPosition key={hand.id} position={hero.position} />
              );
            })}
        </div>
      </div>
    </Card>
  );
}

function PreviousRoundResult({ wonAmount }: { wonAmount: number }) {
  const resultName = wonAmount > 0 ? "Won" : wonAmount < 0 ? "Lost" : "Folded";

  return (
    <div
      className={`border border-gray-200 rounded-md p-2 text-center ${
        wonAmount > 0
          ? "bg-green-500"
          : wonAmount < 0
          ? "bg-red-500"
          : "bg-gray-500"
      }`}
    >
      {wonAmount === 0
        ? "Folded"
        : `${resultName} $${Math.abs(wonAmount).toFixed(2)}`}
    </div>
  );
}

function PreviousRoundCards({ cards }: { cards: CardType[] }) {
  return (
    <div className="w-min border border-gray-200 rounded-md p-2 min-w-[50px] text-center bg-blue-400">
      {`${getChartHandFromCards(cards[0], cards[1])}`}
    </div>
  );
}

function PreviousRoundPosition({ position }: { position: Position | null }) {
  if (!position) {
    return null;
  }
  return (
    <div className="w-min border border-gray-200 rounded-md p-2 min-w-[80px] text-center bg-black">
      {`${position}`}
    </div>
  );
}
