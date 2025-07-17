import { getRangeChartById } from "@/app/serverUtils/serverRequests/chart";
import PokerHandChart from "@/app/components/client/PokerHandChart";
import Button from "@/app/components/client/Button";

export default async function PokerHandChartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fullChart = await getRangeChartById({ id });
  if (!fullChart) {
    return <div>Chart not found</div>;
  }
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-2xl font-bold">{"Chart #" + fullChart.id}</h1>
        <Button
          href={`/pokerHandChart/${fullChart.id}/edit`}
          className="bg-green-500"
        >
          Update
        </Button>
      </div>
      <h3>{"Type: " + fullChart.type.toUpperCase()}</h3>
      <h3>{"Position: " + fullChart.forPosition}</h3>
      {fullChart.againstPosition && (
        <h3>{"Against Position: " + fullChart.againstPosition}</h3>
      )}
      <PokerHandChart value={fullChart.hands} />
    </div>
  );
}
