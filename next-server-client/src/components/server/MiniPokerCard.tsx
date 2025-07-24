import { Card, getCardDisplay, getCardSuitColor } from "@/config/card";

export default function MiniPokerCard({ card }: { card: Card }) {
  return (
    <div className="flex flex-col items-center bg-white justify-center rounded-md p-1">
      <div className={`text-md`} style={{ color: getCardSuitColor(card) }}>
        {getCardDisplay(card)}
      </div>
    </div>
  );
}
