import { Card, getCardDisplay, getCardSuitColor } from "@/config/card";
import { Card as CardShad } from "@/components/ui/card";

export default function MiniPokerCard({ card }: { card: Card }) {
  return (
    <CardShad className="flex flex-col items-center border-foreground justify-center rounded-md p-1">
      <div className={`text-md`} style={{ color: getCardSuitColor(card) }}>
        {getCardDisplay(card)}
      </div>
    </CardShad>
  );
}
