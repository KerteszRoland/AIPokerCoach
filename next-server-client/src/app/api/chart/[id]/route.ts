import {
  getRangeChartById,
  updateRangeChart,
  deleteRangeChart,
  RangeChartUpdateDTO,
} from "@/app/serverUtils/serverRequests/chart";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const chart = await getRangeChartById({ id });
  if (!chart) return new Response("Not found", { status: 404 });
  return Response.json(chart);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body: RangeChartUpdateDTO = await request.json();
    const { id } = await params;
    await updateRangeChart({ id, data: body });
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
    const { id } = await params;
    await deleteRangeChart(id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Error deleting chart", { status: 500 });
  }
}
