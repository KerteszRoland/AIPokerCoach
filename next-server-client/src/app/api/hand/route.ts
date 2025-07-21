import { handJsonToDb } from "@/app/serverUtils/handJsonToDb";
import db from "@/app/serverUtils/db";
import { Hands } from "@/db/schema";
import { getHands } from "@/app/serverUtils/serverRequests/hand";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log(body);
    const isAlreadyInDb = await db.query.Hands.findFirst({
      where: eq(Hands.pokerClientHandId, body.id),
    });
    if (isAlreadyInDb) {
      console.log("Hand already in db");
      return new Response(null, { status: 204 });
    }

    await handJsonToDb(body);

    return new Response(null, { status: 204 });
  } catch (reason) {
    console.error(reason);
    const message =
      reason instanceof Error ? reason.message : "Unexpected error";

    return new Response(message, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "0");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const hands = await getHands(page, pageSize);
  return Response.json(hands);
}
