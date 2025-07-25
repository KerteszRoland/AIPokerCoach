import "server-only";

import { CommunityCardAction } from "@/app/review/[id]/page";
import { getCardDisplay } from "@/config/card";
import { ActionFull, HandFull } from "@/server/serverRequests/hand";
import path from "path";
import fs from "fs";

function getCommunityCardAsText(communityCard: CommunityCardAction) {
  if ("flop1" in communityCard) {
    return `Flop: ${communityCard.flop1} ${communityCard.flop2} ${communityCard.flop3}`;
  }
  if ("turn" in communityCard) {
    return `Turn: ${communityCard.turn}`;
  }
  if ("river" in communityCard) {
    return `River: ${communityCard.river}`;
  }
  return "";
}

function getActionAsText(action: ActionFull) {
  const isHeroAction = action.player.isHero;
  let text: string = action.name;

  // Convert action names to more readable format
  switch (action.name) {
    case "PostSmallBlind":
      text = "Posts SB";
      break;
    case "PostBigBlind":
      text = "Posts BB";
      break;
    case "SitsOut":
      text = "Sits out";
      break;
    case "Fold":
      text = "Folds";
      break;
    case "Call":
      text = "Calls";
      break;
    case "Raise":
      text = "Raises";
      break;
    case "Check":
      text = "Checks";
      break;
    case "Bet":
      text = "Bets";
      break;
    case "BetAndAllIn":
      text = "All-in";
      break;
    case "CallAndAllIn":
      text = "All-in";
      break;
    case "RaiseAndAllIn":
      text = "All-in";
      break;
    case "Muck":
      text = "Mucks";
      break;
    case "Shows":
      text = `Shows ${action.card1} ${action.card2} (${action.text})`;
      break;
    case "Collected":
      text = "Collects";
      break;
    case "CashedOut":
      text = "Cashes out";
      break;
    case "TimedOut":
      text = "Times out";
      break;
    case "UncalledBet":
      text = "Uncalled bet returned";
      break;
    case "DoesNotShow":
      text = "Does not show";
      break;
    case "Join":
      text = "Joins table";
      break;
    case "Leave":
      text = "Leaves table";
      break;
    case "Disconnected":
      text = "Disconnected";
      break;
    case "Connected":
      text = "Connected";
      break;
    case "CollectedFromSidePot":
      text = "Collects from side pot";
      break;
    case "CollectedFromMainPot":
      text = "Collects from main pot";
      break;

    default:
      text = action.name;
      break;
  }

  // Add amount information
  if (action.amount && action.amount2) {
    text = `${text} to $${action.amount2}`;
  } else if (action.amount) {
    text = `${text} $${action.amount}`;
  }

  text = `${isHeroAction ? "You" : action.player.name} (initial chips: $${
    action.player.chips
  }) (${action.player.position}) ${text}`;

  return text;
}

export function getPromptForHandReview(
  hand: HandFull,
  replayActions: (
    | {
        action: ActionFull;
        communityCard: null;
      }
    | {
        action: null;
        communityCard: CommunityCardAction;
      }
  )[]
) {
  const hero = hand.players.find((player) => player.isHero)!;

  const promptTemplate = fs.readFileSync(
    path.join(process.cwd(), "src/server/prompts/prompt1.txt"),
    "utf8"
  );

  const prompt = promptTemplate
    .replace(
      "{HAND}",
      `${
        hero.cards?.card1 && hero.cards?.card2
          ? getCardDisplay(hero.cards.card1) +
            " " +
            getCardDisplay(hero.cards.card2)
          : ""
      }`
    )
    .replace("{POSITION}", hero.position!)
    .replace(
      "{ACTIONS}",
      replayActions
        .map(
          (action, index) =>
            `${index + 1}:` +
            (action.action
              ? getActionAsText(action.action)
              : getCommunityCardAsText(action.communityCard)) +
            "\n"
        )
        .join("")
    );

  return prompt;
}
