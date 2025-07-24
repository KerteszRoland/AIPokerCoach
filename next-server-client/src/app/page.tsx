import Card from "../components/server/Card";
import { FaUser } from "react-icons/fa";
import LiveRangeChart from "../components/client/LiveRangeChart";
import PreviousRoundsCard from "../components/client/PreviousRoundsCard";
import SignedInServer from "@/components/server/SignedInServer";
import SignedOutServer from "@/components/server/SignedOutServer";

export default async function Home() {
  return (
    <main className="flex flex-col items-center">
      <SignedOutServer>
        <p>Sign in to see your hands</p>
      </SignedOutServer>
      <SignedInServer>
        <div className="flex items-start justify-between max-w-[1400px] w-full px-8 pt-8">
          <div className="flex flex-col max-w-[400px] gap-4">
            <CoachReviewCard />
            <PreviousRoundsCard />
          </div>
          <div className="flex flex-col max-w-[600px]">
            <LiveRangeChart />
          </div>
        </div>
      </SignedInServer>
    </main>
  );
}

function CoachReviewCard() {
  return (
    <Card>
      <div className="flex flex-row gap-4">
        <div className="flex flex-col gap-2 items-center pt-2">
          <FaUser className="h-10 w-10 text-orange-300" />
          <p className="text-lg text-center">AI Coach</p>
        </div>
        <div className="text-lg max-h-[150px] overflow-y-auto">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
          quos.Lorem ipsum dolor sit amet consectetur adipisicing elit.
          Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Quisquam, quos.Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Quisquam, quos.
        </div>
      </div>
    </Card>
  );
}
