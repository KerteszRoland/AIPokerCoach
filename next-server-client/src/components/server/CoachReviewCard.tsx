import { FaUser } from "react-icons/fa";
import Card from "./Card";

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
      <div className="absolute top-[-10px] right-0">
        {coachRating && (
          <span
            className={`absolute right-0 text-md font-semibold px-2 py-1 rounded-full transform translate-x-1/2 ${
              coachRating === "Good"
                ? "bg-green-200 text-green-800"
                : coachRating === "Neutral"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-red-200 text-red-800"
            }`}
          >
            {coachRating}
          </span>
        )}
      </div>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-2 items-center pt-2 flex-shrink-0">
          <FaUser className="h-10 w-10 text-orange-300" />
          <p className="text-md text-center">{coachName}</p>
        </div>
        <div className="text-sm h-[100px] overflow-y-auto">
          {coachDescription}
        </div>
      </div>
    </Card>
  );
}
