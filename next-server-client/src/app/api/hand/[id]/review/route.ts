import { NextResponse } from "next/server";
import db from "@/server/db";
import { HandReviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  createHandReview,
  getHandReview,
} from "@/server/serverRequests/handReview";
import { getUserIdFromSession } from "@/server/getUserIdFromSession";
import { getHandById } from "@/server/serverRequests/hand";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: handId } = await params;
  const handReview = await getHandReview(handId);

  if (!handReview) {
    return NextResponse.json(
      { error: "Hand review not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(handReview);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: handId } = await params;
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const hand = await getHandById(handId, userId);
    if (!hand) {
      throw new Error("Hand not found");
    }

    // Check if hand already has a review
    const existingReview = await db.query.HandReviews.findFirst({
      where: eq(HandReviews.handId, handId),
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "HandReview already exists" },
        { status: 409 }
      );
    }
    await createHandReview(hand);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing hand:", error);
    return NextResponse.json(
      { error: "Failed to process hand" },
      { status: 500 }
    );
  }
}
