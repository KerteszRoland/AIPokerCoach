"use client";
import { CommunityCardAction } from "@/app/review/[id]/page";
import Card from "@/components/server/Card";
import MiniPokerCard from "@/components/server/MiniPokerCard";
import { getCardSuitColor } from "@/config/card";
import { ActionFull } from "@/server/serverRequests/hand";
import { useEffect, useRef, useState } from "react";
import CoachReviewCard from "../server/CoachReviewCard";
import PokerTable from "../server/PokerTable";

interface ReplayPageClientProps {
  hand: any;
  replayActions: {
    action: ActionFull | null;
    communityCard: CommunityCardAction | null;
  }[];
}

// Map action names to display colors
const getActionColor = (actionName: string) => {
  const foldActions = [
    "Fold",
    "Check",
    "SitsOut",
    "TimedOut",
    "Muck",
    "DoesNotShow",
  ];
  const callActions = ["Call", "CallAndAllIn"];
  const raiseActions = [
    "Raise",
    "Bet",
    "RaiseAndAllIn",
    "BetAndAllIn",
    "PostSmallBlind",
    "PostBigBlind",
  ];

  if (foldActions.includes(actionName)) {
    return "bg-gray-400 text-gray-800";
  } else if (callActions.includes(actionName)) {
    return "bg-green-400 text-green-800";
  } else if (raiseActions.includes(actionName)) {
    return "bg-red-400 text-red-800";
  } else {
    return "bg-blue-400 text-blue-800"; // Default for other actions
  }
};

export default function ReplayPageClient({
  hand,
  replayActions,
}: ReplayPageClientProps) {
  const actionsContainerRef = useRef<HTMLDivElement>(null);
  const [currentActionIndex, setCurrentActionIndex] = useState(0);
  const hero = hand.players.find((player: any) => player.isHero)!;

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Home":
          goToStart();
          break;
        case "End":
          goToEnd();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentActionIndex, replayActions.length]);

  const goToPrevious = () => {
    setCurrentActionIndex(Math.max(0, currentActionIndex - 1));
  };

  const goToNext = () => {
    setCurrentActionIndex(
      Math.min(replayActions.length - 1, currentActionIndex + 1)
    );
  };

  const goToStart = () => {
    setCurrentActionIndex(0);
  };

  const goToEnd = () => {
    setCurrentActionIndex(replayActions.length - 1);
  };

  return (
    <div className="flex flex-row justify-between gap-4 w-full px-8">
      <div className="flex flex-col items-center gap-4 max-w-[400px]">
        <CoachReviewCard />
        <Card
          className="w-full"
          Header={
            <div className="text-center">
              <h1 className="text-xl font-bold mb-2">
                Hand #{hand.pokerClientHandId}
              </h1>
              <div className="flex justify-between items-center">
                <span className="text-lg">
                  Position: <strong>{hero.position}</strong>
                </span>
                <div className="flex gap-1">
                  <MiniPokerCard card={hero.cards!.card1} />
                  <MiniPokerCard card={hero.cards!.card2} />
                </div>
              </div>
            </div>
          }
        >
          <div
            className="flex flex-col gap-2 max-h-40 min-h-40 overflow-y-auto px-2"
            ref={actionsContainerRef}
          >
            {replayActions
              .slice(0, currentActionIndex + 1)
              .map((actionOrCommunityCard, index) => {
                return (
                  <ReplayActionElement
                    key={`action-${index}`}
                    action={actionOrCommunityCard.action}
                    communityCard={actionOrCommunityCard.communityCard}
                    index={index}
                    currentActionIndex={currentActionIndex}
                    onClick={() => {
                      setCurrentActionIndex(index);
                    }}
                  />
                );
              })}
          </div>

          {/* Navigation controls */}
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={goToStart}
              disabled={currentActionIndex === 0}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ≪
            </button>
            <button
              onClick={goToPrevious}
              disabled={currentActionIndex === 0}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ←
            </button>
            <button className="px-4 py-2 rounded bg-gray-200 text-gray-800">
              ⏸
            </button>
            <button
              onClick={goToNext}
              disabled={currentActionIndex === replayActions.length - 1}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              →
            </button>
            <button
              onClick={goToEnd}
              disabled={currentActionIndex === replayActions.length - 1}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ≫
            </button>
          </div>
        </Card>
      </div>
      <PokerTable />
    </div>
  );
}

function ReplayActionElement({
  action,
  communityCard,
  index,
  currentActionIndex,
  onClick,
}: {
  action: ActionFull | null;
  communityCard: CommunityCardAction | null;
  index: number;
  currentActionIndex: number;
  onClick?: () => void;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const isCurrentAction = index === currentActionIndex;

  const scrollToAction = () => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  useEffect(() => {
    if (isCurrentAction) {
      scrollToAction();
    }
  }, [isCurrentAction]);

  return (
    <div ref={elementRef} onClick={onClick} className="cursor-pointer">
      {communityCard && (
        <div
          className={`rounded-lg px-2 py-1 text-center text-sm font-medium bg-yellow-300 text-yellow-800 border-2 ${
            isCurrentAction ? "border-blue-500 shadow-lg" : "border-transparent"
          }`}
        >
          {"flop1" in communityCard &&
            "flop2" in communityCard &&
            "flop3" in communityCard && (
              <div className="flex flex-row items-center justify-center gap-2">
                <span className="font-bold">Flop:</span>
                <div className="flex flex-row items-center justify-center gap-1">
                  <MiniPokerCard card={communityCard.flop1} />
                  <MiniPokerCard card={communityCard.flop2} />
                  <MiniPokerCard card={communityCard.flop3} />
                </div>
              </div>
            )}
          {"turn" in communityCard && (
            <div className="flex flex-row items-center justify-center gap-2">
              <span className="font-bold">Turn:</span>
              <MiniPokerCard card={communityCard.turn} />
            </div>
          )}
          {"river" in communityCard && (
            <div className="flex flex-row items-center justify-center gap-2">
              <span className="font-bold">River:</span>
              <MiniPokerCard card={communityCard.river} />
            </div>
          )}
        </div>
      )}
      {action && (
        <div
          key={index}
          className={`relative rounded-lg px-2   py-1 text-center font-medium border-2 ${
            isCurrentAction ? "border-blue-500 shadow-lg" : "border-transparent"
          } ${getActionColor(action.name)}`}
        >
          {isCurrentAction && (
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full"></div>
          )}
          <ActionContent action={action} />
          {isCurrentAction && false && (
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded text-sm font-bold">
              ok
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ActionContent({ action }: { action: ActionFull }) {
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
    case "RaiseAndAllIn":
      text = "All-in";
      break;
    case "CallAndAllIn":
      text = "All-in";
      break;
    case "BetAndAllIn":
      text = "All-in";
      break;
    case "Muck":
      text = "Mucks";
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

  return (
    <div className="flex flex-col items-center justify-center gap-2 text-sm">
      <div className="flex flex-row items-center justify-center gap-2">
        <span className="font-bold">
          {isHeroAction ? "You" : action.player.name}
        </span>
        <span>{text}</span>
        {action.name === "Shows" && (
          <div className="flex flex-row items-center justify-center gap-1">
            <MiniPokerCard card={action.card1!} />
            <MiniPokerCard card={action.card2!} />
          </div>
        )}
      </div>
      {action.text && (
        <div className="text-xs text-gray-500">
          <span>({action.text})</span>
        </div>
      )}
    </div>
  );
}
