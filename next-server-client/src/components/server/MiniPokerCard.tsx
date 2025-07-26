import { Card, getCardDisplay, getCardSuitColor } from "@/config/card";
import { Card as CardShad } from "@/components/ui/card";

export default function MiniPokerCard({
  card,
  sizeName = "md",
}: {
  card: Card;
  sizeName?: "sm" | "md" | "lg";
}) {
  return (
    <CardShad className="flex flex-col items-center justify-center border-2 rounded-md p-1 border-secondary-300">
      <div
        className={`text-${sizeName}`}
        style={{ color: getCardSuitColor(card) }}
      >
        {getCardDisplay(card)}
      </div>
    </CardShad>
  );
}
