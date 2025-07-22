import { PositionsArray } from "@/config/position";
import {
  ChartActionsArray,
  ChartTypesArray,
  ChartHandsArray,
} from "@/config/chart";
import {
  getRangeChartById,
  updateRangeChart,
  deleteRangeChart,
  RangeChartUpdateDTO,
} from "@/server/serverRequests/chart";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chart = await getRangeChartById({ id });
  if (!chart) return new Response("Not found", { status: 404 });
  return Response.json(chart);
}

const chartUpdateSchema = z.object({
  type: z.enum(ChartTypesArray).optional(),
  forPosition: z.enum(PositionsArray).optional(),
  againstPosition: z.enum(PositionsArray).nullable().optional(),
  hands: z
    .array(
      z.object({
        hand: z.enum(ChartHandsArray),
        action: z.enum(ChartActionsArray),
      })
    )
    .optional(),
}) satisfies z.ZodType<RangeChartUpdateDTO>;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const body = await request.json();
    const parsedBody = chartUpdateSchema.parse(body);
    const { id } = z.object({ id: z.string() }).parse(params);
    await updateRangeChart({ id, data: parsedBody });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Error updating chart", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const { id } = z.object({ id: z.string() }).parse(params);
    await deleteRangeChart(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Error deleting chart", { status: 500 });
  }
}
