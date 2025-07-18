import { handJsonToDb } from "@/app/serverUtils/handJsonToDb";
import db from "@/app/serverUtils/db";
import { Hands } from "@/db/schema";
import { getMostRecentHand } from "@/app/serverUtils/serverRequests/hand";
import { notifyNewHand } from "@/app/serverUtils/sse";
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
    try {
      notifyNewHand();
    } catch (error) {
      console.error(error);
    }

    try {
      return new Response(null, { status: 204 });
    } catch (error) {
      console.error(error);
    }
  } catch (reason) {
    console.error(reason);
    const message =
      reason instanceof Error ? reason.message : "Unexpected error";

    return new Response(message, { status: 500 });
  }
}

export async function GET() {
  const hand = await getMostRecentHand();
  return Response.json(hand);
}
