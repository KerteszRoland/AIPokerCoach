import { getRangeChartById } from "@/server/serverRequests/chart";
import RangeChartUpdateForm from "@/components/client/RangeChartUpdateForm";
import RangeChartCreateForm from "@/components/client/RangeChartCreateForm";

export default async function EditPokerHandChartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const isNew = id === "new";
  if (isNew) {
    return <RangeChartCreateForm />;
  }
  const chart = await getRangeChartById({ id });
  if (!chart) {
    return <div>Chart not found</div>;
  }
  return <RangeChartUpdateForm chart={chart} />;
}
