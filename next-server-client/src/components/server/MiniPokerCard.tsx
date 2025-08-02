import { Card, getCardDisplay, getCardSuitColor } from "@/config/card";
import { Card as CardShad } from "@/components/ui/card";
import Image from "next/image";
import icon from "@/app/favicon.ico";

export default function MiniPokerCard({
  card,
  sizeName = "md",
}: {
  card: Card | null;
  sizeName?: "sm" | "md" | "lg";
}) {
  return (
    <CardShad className="flex flex-col items-center justify-center border-2 rounded-md p-1 border-secondary-300">
      {card && (
        <div
          className={`text-${sizeName}`}
          style={{ color: getCardSuitColor(card) }}
        >
          {getCardDisplay(card)}
        </div>
      )}
      {!card && (
        <div className={`text-${sizeName} text-card relative`}>
          {"XX"}
          <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-4 h-4">
            <Image src={icon} alt="cardBack" width={50} height={50} />
          </div>
        </div>
      )}
    </CardShad>
  );
}
