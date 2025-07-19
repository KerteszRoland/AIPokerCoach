import { getMostRecentHand } from "@/app/serverUtils/serverRequests/hand";

export async function GET() {
  const hand = await getMostRecentHand();
  return Response.json(hand);
}
