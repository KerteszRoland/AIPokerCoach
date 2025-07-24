import { FaUser } from "react-icons/fa";
import Card from "./Card";

export default function CoachReviewCard({
  coachName = "AI Coach",
  coachDescription = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
}: {
  coachName?: string;
  coachDescription?: string;
}) {
  return (
    <Card>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-2 items-center pt-2">
          <FaUser className="h-10 w-10 text-orange-300" />
          <p className="text-md text-center">{coachName}</p>
        </div>
        <div className="text-sm max-h-[150px] overflow-y-auto">
          {coachDescription}
        </div>
      </div>
    </Card>
  );
}
