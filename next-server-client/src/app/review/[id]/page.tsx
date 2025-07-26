import { Card as CardType } from "@/config/card";
import getSessionOrRedirect from "@/server/getSessionOrRedirect";
import { getHandById } from "@/server/serverRequests/hand";
import { notFound } from "next/navigation";
import ReplayPageClient from "@/components/client/ReplayPageClient";
import { getReplayActionsFromHand } from "@/server/getReplayActionsFromHand";
import { getHandReview } from "@/server/serverRequests/handReview";
import { HandReview } from "@/utils/validations/handReviewValidationSchema";

type CommunityCardFlop = {
  flop1: CardType;
  flop2: CardType;
  flop3: CardType;
};

type CommunityCardTurn = {
  turn: CardType;
};

type CommunityCardRiver = {
  river: CardType;
};

export type CommunityCardAction =
  | CommunityCardFlop
  | CommunityCardTurn
  | CommunityCardRiver;

export default async function ReviewIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const session = await getSessionOrRedirect();
    const { id } = await params;
    const hand = await getHandById(id, session.userId);

    if (!hand) {
      return notFound();
    }

    const replayActions = getReplayActionsFromHand(hand);
    const handReview: HandReview | null = await getHandReview(id);

    return (
      <ReplayPageClient
        hand={hand}
        replayActions={replayActions}
        handReview={handReview}
      />
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.message === "NEXT_REDIRECT") {
      return notFound();
    }
    return (
      <div>
        Error: {error instanceof Error ? error.message : "Unknown error"}
      </div>
    );
  }
}
