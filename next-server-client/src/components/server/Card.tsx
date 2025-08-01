import { Card as CardShad } from "@/components/ui/card";
import { Separator } from "../ui/separator";

export default function Card({
  className,
  children,
  Header,
  scrollableContentMaxHeight,
}: {
  className?: string;
  Header?: React.ReactNode;
  children: React.ReactNode;
  scrollableContentMaxHeight?: number;
}) {
  return (
    <CardShad className={`${Header ? "py-2" : "p-4"} ${className}`}>
      {Header && (
        <div className="flex flex-col">
          <div className="px-4">{Header}</div>
          <Separator className="border-1 mt-2 mb-4" />
          <div
            className={`mx-4 ${
              scrollableContentMaxHeight
                ? "max-h-[${scrollableContentMaxHeight}px] overflow-y-auto"
                : ""
            }`}
          >
            {children}
          </div>
        </div>
      )}
      {!Header && children}
    </CardShad>
  );
}
