import HandSocket from "./components/client/HandSocket";
import PokerHandChart from "./components/server/PokerHandChart";
import getMostRecentHand from "./serverUtils/getMostRecentHand";

export const metadata = {
  title: "AI Poker Coach",
  description: "Help you improve your poker skills with the power of AI.",
};

export default async function Home() {
  const hand = await getMostRecentHand();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">AI Poker Coach</h1>
        <p className="text-lg">
          Help you improve your poker skills with the power of AI.
        </p>
        <PokerHandChart />
        {hand && <HandSocket initialHand={hand} />}
      </main>
    </div>
  );
}
