import { getRangeCharts } from "@/server/serverRequests/chart";
import PokerHandChart from "../../components/client/PokerHandChart";
import Button from "../../components/client/Button";

export default async function PokerHandChartPage() {
  const { charts, total } = await getRangeCharts();
  return (
    <>
      <h1>{"Poker Hand Charts"}</h1>
      <Button href="/pokerHandChart/new/edit" className="bg-green-500">
        Create
      </Button>
      <h2>{"Total: " + total}</h2>
      <div className="flex flex-col gap-4">
        {charts.map((chart) => (
          <div key={chart.id} className="flex flex-col items-start gap-2">
            <div className="flex justify-between items-center gap-4">
              {chart.id}
              <Button
                href={`/pokerHandChart/${chart.id}`}
                className="bg-blue-500"
              >
                View
              </Button>
            </div>
            <div className="flex justify-between items-center gap-4">
              <h3>{"Type: " + chart.type.toUpperCase()}</h3>
              <h3>{"Position: " + chart.forPosition}</h3>
              {chart.againstPosition && (
                <h3>{"Against Position: " + chart.againstPosition}</h3>
              )}
            </div>
            <PokerHandChart value={chart.hands} />
          </div>
        ))}
      </div>
    </>
  );
}
