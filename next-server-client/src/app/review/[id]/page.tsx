import { ActionNames, Streets } from "@/config/action";
import { Card as CardType } from "@/config/card";
import getSessionOrRedirect from "@/server/getSessionOrRedirect";
import { ActionFull, getHandById } from "@/server/serverRequests/hand";
import { PageNotFoundError } from "next/dist/shared/lib/utils";
import { notFound } from "next/navigation";
import ReplayPageClient from "@/components/client/ReplayPageClient";
import { promptAI } from "@/server/genAI";
import { getPromptForHandReview } from "@/utils/getPromptForHandReview";
import path from "path";
import fs from "fs";
import { reviewSchema } from "@/config/review";

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

    const insertCommunityCardActionAfterIndex = (
      replayActions: (
        | {
            action: ActionFull;
            communityCard: null;
          }
        | {
            action: null;
            communityCard: CommunityCardAction;
          }
      )[],
      index: number,
      communityCard: CommunityCardAction
    ) => {
      return [
        ...replayActions.slice(0, index + 1),
        { action: null, communityCard },
        ...replayActions.slice(index + 1),
      ];
    };

    let replayActions: (
      | {
          action: ActionFull;
          communityCard: null;
        }
      | {
          action: null;
          communityCard: CommunityCardAction;
        }
    )[] = [...hand.actions]
      .filter(
        (x) =>
          !["Connected", "Disconnected", "SitsOut", "Join", "Leave"].includes(
            x.name
          )
      )
      .map((x) => ({ action: x, communityCard: null }));

    if (hand.communityCards?.flop1) {
      const highestSequence = hand.actions
        .filter((x) => x.street === Streets.Preflop)
        .map((x) => x.sequence)
        .reduce((max, sequence) => Math.max(max, sequence), -Infinity);

      let insertIndex = replayActions.findIndex(
        (x) =>
          x.action?.sequence === highestSequence &&
          x.action?.street === Streets.Preflop
      );

      if (insertIndex === -1) {
        insertIndex = replayActions.findIndex(
          (x) => x.action?.street !== Streets.Showdown
        );
      }

      replayActions = insertCommunityCardActionAfterIndex(
        replayActions,
        insertIndex,
        {
          flop1: hand.communityCards!.flop1!,
          flop2: hand.communityCards!.flop2!,
          flop3: hand.communityCards!.flop3!,
        }
      );
    }

    if (hand.communityCards?.turn) {
      const highestSequence = hand.actions
        .filter((x) => x.street === Streets.Flop)
        .map((x) => x.sequence)
        .reduce((max, sequence) => Math.max(max, sequence), -Infinity);

      let insertIndex = replayActions.findIndex(
        (x) =>
          x.action?.sequence === highestSequence &&
          x.action?.street === Streets.Flop
      );

      if (insertIndex === -1) {
        insertIndex = replayActions.findIndex(
          (x) => x.action?.street !== Streets.Showdown
        );
      }

      replayActions = insertCommunityCardActionAfterIndex(
        replayActions,
        insertIndex,
        { turn: hand.communityCards!.turn! }
      );
    }

    if (hand.communityCards?.river) {
      const highestSequence = hand.actions
        .filter((x) => x.street === Streets.Turn)
        .map((x) => x.sequence)
        .reduce((max, sequence) => Math.max(max, sequence), -Infinity);

      let insertIndex = replayActions.findIndex(
        (x) =>
          x.action?.sequence === highestSequence &&
          x.action?.street === Streets.Turn
      );

      if (insertIndex === -1) {
        insertIndex = replayActions.findIndex(
          (x) => x.action?.street !== Streets.Showdown
        );
      }

      replayActions = insertCommunityCardActionAfterIndex(
        replayActions,
        insertIndex,
        { river: hand.communityCards!.river! }
      );
    }

    /*
    const handReview = await promptAI(
      getPromptForHandReview(hand, replayActions)
    );*/

    const handReviewResponse = fs.readFileSync(
      path.join(process.cwd(), "src/server/prompts/review_example.txt"),
      "utf8"
    );
    const strippedReview = handReviewResponse
      .replace(/```json/g, "")
      .replace(/```/g, "");
    const handReview = reviewSchema.parse(JSON.parse(strippedReview));

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
