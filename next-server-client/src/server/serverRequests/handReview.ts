import { eq } from "drizzle-orm";
import db from "../db";
import { HandReviews } from "@/db/schema";
import {
  HandReview,
  handReviewCreateSchema,
  handReviewSchema,
} from "@/utils/validations/handReviewValidationSchema";
import { promptAI } from "../genAI";
import { getPromptForHandReview } from "@/server/getPromptForHandReview";
import { HandFull } from "./hand";
import { getReplayActionsFromHand } from "../getReplayActionsFromHand";

export async function getHandReview(
  handId: string
): Promise<HandReview | null> {
  try {
    const review = await db.query.HandReviews.findFirst({
      where: eq(HandReviews.handId, handId),
    });
    if (!review) {
      return null;
    }
    const reviewParsed = handReviewSchema.parse(review);
    return reviewParsed;
  } catch (error) {
    console.error("Error getting hand review:", error);
    throw error;
  }
}

export async function createHandReview(hand: HandFull) {
  try {
    const replayActions = getReplayActionsFromHand(hand);
    const handReviewResponse = await promptAI(
      getPromptForHandReview(hand, replayActions)
    );

    console.log("handReviewResponse", handReviewResponse.slice(0, 30));
    const strippedReview = handReviewResponse
      .replace(/```json/g, "")
      .replace(/```/g, "");

    const parsedReview = JSON.parse(strippedReview);
    console.log("parsedReview", parsedReview);
    const handReviewContent = handReviewCreateSchema.parse(parsedReview);

    const reviewId = crypto.randomUUID();
    await db.insert(HandReviews).values({
      id: reviewId,
      handId: hand.id,
      content: handReviewContent,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating hand review:", error);
    throw error;
  }
}
