import {
  getRangeChartById,
  updateRangeChart,
  deleteRangeChart,
  RangeChartUpdateDTO,
} from "@/app/serverUtils/serverRequests/chart";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const chart = await getRangeChartById({ id: params.id });
  if (!chart) return new Response("Not found", { status: 404 });
  return Response.json(chart);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body: RangeChartUpdateDTO = await request.json();
    await updateRangeChart({ id: params.id, data: body });
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Error updating chart", { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteRangeChart(params.id);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return new Response("Error deleting chart", { status: 500 });
  }
}
