import { handJsonToDb } from "@/server/handJsonToDb";
import db from "@/server/db";
import { Hands } from "@/db/schema";
import { getHands } from "@/server/serverRequests/hand";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import authOptions from "../auth/[...nextauth]/options";

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
    const google_access_token = body.google_access_token;

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
  const session = await getServerSession(authOptions);
  if (!session || !session.userId) {
    console.log("No session or userId", session);
    return new Response(null, { status: 401 });
  }
  console.log("Session and userId", session.userId);
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "0");
  const pageSize = Number(searchParams.get("pageSize") ?? "10");
  const hands = await getHands(page, pageSize, session.userId);
  return Response.json(hands);
}
