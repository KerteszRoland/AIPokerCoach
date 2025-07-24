import { getMostRecentHand } from "@/server/serverRequests/hand";

export async function GET() {
  const hand = await getMostRecentHand();
  return Response.json(hand);
}
