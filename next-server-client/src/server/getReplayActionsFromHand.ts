import { CommunityCardAction } from "@/app/review/[id]/page";
import { ActionFull, HandFull } from "./serverRequests/hand";
import { Streets } from "@/config/action";

export type ReplayAction =
  | {
      action: ActionFull;
      communityCard: null;
    }
  | {
      action: null;
      communityCard: CommunityCardAction;
    };

const insertCommunityCardActionAfterIndex = (
  replayActions: ReplayAction[],
  index: number,
  communityCard: CommunityCardAction
) => {
  return [
    ...replayActions.slice(0, index + 1),
    { action: null, communityCard },
    ...replayActions.slice(index + 1),
  ];
};

export function getReplayActionsFromHand(hand: HandFull): ReplayAction[] {
  let replayActions: ReplayAction[] = [...hand.actions]
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
  return replayActions;
}
