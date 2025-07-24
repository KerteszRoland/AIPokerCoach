import {
  createRangeChart,
  RangeChartCreateDTO,
  RangeChartFullFromDb,
} from "@/server/serverRequests/chart";
import db from "@/server/db";
import { Position } from "@/config/position";
import {
  ChartActionsArray,
  ChartHandsArray,
  ChartTypesArray,
} from "@/config/chart";
import { PositionsArray } from "@/config/position";
import { ChartType } from "@/config/chart";
import { z } from "zod";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const entries = Object.fromEntries(searchParams.entries());
  const { page, pageSize, forPosition, againstPosition, type } = z
    .object({
      page: z.coerce.number().optional().default(0),
      pageSize: z.coerce.number().optional().default(10),
      forPosition: z.enum(PositionsArray).optional(),
      againstPosition: z.enum(PositionsArray).nullable().optional(),
      type: z.enum(ChartTypesArray).optional(),
    })
    .parse(entries);

  const charts = await db.query.RangeCharts.findMany({
    limit: pageSize,
    offset: page * pageSize,
    with: {
      hands: true,
    },
    where: (charts, { eq, and }) => {
      const eqs = [];
      if (forPosition)
        eqs.push(eq(charts.forPosition, forPosition as Position));
      if (againstPosition)
        eqs.push(eq(charts.againstPosition, againstPosition as Position));
      if (type) eqs.push(eq(charts.type, type as ChartType));

      return and(...eqs);
    },
  });

  const chartsFull = charts.map(RangeChartFullFromDb);
  return Response.json(chartsFull);
}

const chartCreateSchema = z.object({
  type: z.enum(ChartTypesArray),
  forPosition: z.enum(PositionsArray),
  againstPosition: z.enum(PositionsArray).nullable(),
  hands: z.array(
    z.object({
      hand: z.enum(ChartHandsArray),
      action: z.enum(ChartActionsArray),
    })
  ),
}) satisfies z.ZodType<RangeChartCreateDTO>;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = chartCreateSchema.parse(body);
    const chart = await createRangeChart(parsedBody);
    return Response.json(chart, { status: 201 });
  } catch (error) {
    console.error(error);
    return new Response("Error creating chart", { status: 500 });
  }
}
