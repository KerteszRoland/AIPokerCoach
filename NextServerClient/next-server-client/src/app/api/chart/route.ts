import {
  createRangeChart,
  RangeChartCreateDTO,
  RangeChartFullFromDb,
} from "@/app/serverUtils/serverRequests/chart";
import db from "@/app/serverUtils/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "0";
  const pageSize = searchParams.get("pageSize") ?? "10";
  const forPosition = searchParams.get("forPosition");
  const againstPosition = searchParams.get("againstPosition");
  const type = searchParams.get("type");

  const charts = await db.query.RangeCharts.findMany({
    limit: pageSize ? parseInt(pageSize) : 10,
    offset: page ? parseInt(page) * parseInt(pageSize) : 0,
    with: {
      hands: true,
    },
    where: (charts, { eq, and }) => {
      const eqs = [];
      if (forPosition) eqs.push(eq(charts.forPosition, forPosition));
      if (againstPosition)
        eqs.push(eq(charts.againstPosition, againstPosition));
      if (type) eqs.push(eq(charts.type, type));

      return and(...eqs);
    },
  });

  const chartsFull = charts.map(RangeChartFullFromDb);
  return Response.json(chartsFull);
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
