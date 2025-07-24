import { CommunityCardAction } from "@/app/review/[id]/page";
import { getCardDisplay } from "@/config/card";
import { ActionFull, HandFull } from "@/server/serverRequests/hand";

export function getPromptForHandReview(
  hand: HandFull,
  replayActions: {
    action: ActionFull | null;
    communityCard: CommunityCardAction | null;
  }[]
) {
  const hero = hand.players.find((player) => player.isHero)!;
  const prompt = `
    You are a poker coach.
    You are given a hand and a list of actions.
    You need to review the hand and the actions and give a review of the hand.

    Your Hand: ${
      hero.cards?.card1 && hero.cards?.card2
        ? getCardDisplay(hero.cards.card1) +
          " " +
          getCardDisplay(hero.cards.card2)
        : ""
    }   
    Actions: ${replayActions.map((action) => action.action?.name).join(", ")}
    `;

  return prompt;
}
