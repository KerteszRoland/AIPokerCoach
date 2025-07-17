import {
  createRangeChart,
  RangeChartFull,
  RangeChartCreateDTO,
} from "@/app/serverUtils/serverRequests/chart";
import db from "@/app/serverUtils/db";

export async function GET() {
  const charts: RangeChartFull[] = await db.query.RangeCharts.findMany({
    with: {
      hands: true,
    },
  });
  return Response.json(charts);
}

export async function POST(request: Request) {
  try {
    const body: RangeChartCreateDTO = await request.json();
    const chart = await createRangeChart(body);
    return Response.json(chart, { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Error creating chart", { status: 500 });
  }
}
