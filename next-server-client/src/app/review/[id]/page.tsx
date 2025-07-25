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

    const replayActions: (
      | {
          action: ActionFull;
          communityCard: null;
        }
      | {
          action: null;
          communityCard: CommunityCardAction;
        }
    )[] = [];

    hand.actions
      .filter(
        (action) =>
          ![
            ActionNames.Connected,
            ActionNames.Disconnected,
            ActionNames.SitsOut,
            ActionNames.Join,
            ActionNames.Leave,
          ].includes(action.name)
      )
      .forEach((action) => {
        if (action.sequence === 0) {
          switch (action.street) {
            case Streets.Flop:
              replayActions.push({
                action: null,
                communityCard: {
                  flop1: hand.communityCards!.flop1!,
                  flop2: hand.communityCards!.flop2!,
                  flop3: hand.communityCards!.flop3!,
                },
              });
              break;
            case Streets.Turn:
              replayActions.push({
                action: null,
                communityCard: {
                  turn: hand.communityCards!.turn!,
                },
              });
              break;
            case Streets.River:
              replayActions.push({
                action: null,
                communityCard: {
                  river: hand.communityCards!.river!,
                },
              });
              break;
          }
        }
        replayActions.push({ action: action, communityCard: null });
      });

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
