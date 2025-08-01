import PreviousRoundsCard from "../components/client/PreviousRoundsCard";
import SignedInServer from "@/components/server/SignedInServer";
import SignedOutServer from "@/components/server/SignedOutServer";
import getSessionOrRedirect from "@/server/getSessionOrRedirect";
import { getHands } from "@/server/serverRequests/hand";

export default async function Home() {
  const session = await getSessionOrRedirect();
  const hands = await getHands(0, 30, session.userId);

  return (
    <>
      <SignedOutServer>
        <p>Sign in to see your hands</p>
      </SignedOutServer>
      <SignedInServer>
        <div className="flex items-start justify-between max-w-[1400px] w-full px-8 pt-8">
          <div className="flex flex-col max-w-[400px] gap-4">
            <PreviousRoundsCard hands={hands} />
          </div>
        </div>
      </SignedInServer>
    </>
  );
}
