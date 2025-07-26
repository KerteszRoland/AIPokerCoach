import { FaMeh, FaThumbsDown, FaThumbsUp, FaUser } from "react-icons/fa";
import Card from "./Card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function CoachReviewCard({
  coachName = "AI Coach",
  coachDescription = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
  coachRating,
}: {
  coachName?: string;
  coachDescription?: string;
  coachRating?: string;
}) {
  return (
    <Card className="w-full relative">
      <div className="absolute top-0 right-0">
        {coachRating && !["None", "Neutral"].includes(coachRating) && (
          <Badge
            className={`absolute top-0 right-0 font-semibold transform translate-x-1/2 translate-y-[-25%] ${
              coachRating === "Good"
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            <div>
              {coachRating === "Good" ? (
                <FaThumbsUp size={24} />
              ) : (
                <FaThumbsDown size={24} />
              )}
            </div>
          </Badge>
        )}
      </div>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-2 items-center pt-2 flex-shrink-0">
          <FaUser className="h-10 w-10 text-orange-300" />
          <p className="text-md text-center">{coachName}</p>
        </div>
        <ScrollArea className="text-sm h-[100px] rounded-md  px-4 w-full">
          {coachDescription}
        </ScrollArea>
      </div>
    </Card>
  );
}
