"use client";

import { useState } from "react";
import {
  ChartAction,
  ChartActions,
  ChartActionsArray,
  ChartHand,
  isValidChartHand,
} from "@/config/chart";

function getHandTable(): ChartHand[][] {
  function indexToCard(index: number) {
    if (index < 0 || index > 12) {
      throw new Error("index parameter given is less than 0 or grater than 12");
    }
    const cards = [
      "A",
      "K",
      "Q",
      "J",
      "T",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
    ];
    return cards[index];
  }

  const size = 13;
  const handTable: ChartHand[][] = [];

  for (let i = 0; i < size; i++) {
    const row: ChartHand[] = [];
    for (let j = 0; j < size; j++) {
      row.push("" as ChartHand); // you did not see anything, ok?
    }
    handTable.push(row);
  }

  //Suited hands
  // 0,1
  // 1,2
  // 2,3
  for (let i = 0; i < handTable.length; i++) {
    for (let j = i + 1; j < handTable[0].length; j++) {
      const hand = `${indexToCard(i)}${indexToCard(j)}s`;
      if (!isValidChartHand(hand)) {
        throw new Error("Invalid hand");
      }
      handTable[i][j] = hand;
    }
  }

  // Pairs
  // 0,0
  // 1,1
  // 2,2
  for (let i = 0; i < handTable.length; i++) {
    const hand = `${indexToCard(i)}${indexToCard(i)}`;
    if (!isValidChartHand(hand)) {
      throw new Error("Invalid hand");
    }
    handTable[i][i] = hand;
  }

  //Off suit hands
  // 1,0
  // 2,1
  // 3,2

  for (let i = 1; i < handTable.length; i++) {
    for (let j = 0; j < i; j++) {
      const hand = `${indexToCard(j)}${indexToCard(i)}o`;
      if (!isValidChartHand(hand)) {
        throw new Error("Invalid hand");
      }
      handTable[i][j] = hand;
    }
  }

  return handTable;
}

function getActionColor(action: ChartAction) {
  switch (action) {
    case ChartActions.raise:
      return "bg-red-500";
    case ChartActions.call:
      return "bg-green-500";
    case ChartActions.bet3:
      return "bg-blue-500";
    case ChartActions.bet4:
      return "bg-purple-500";
  }
}

export default function PokerHandChart({
  value = [],
  editable = false,
  showColorExplanation = false,
  onChange,
}: {
  value?: { hand: ChartHand; action: ChartAction }[];
  editable?: boolean;
  showColorExplanation?: boolean;
  onChange?: (value: { hand: ChartHand; action: ChartAction }[]) => void;
}) {
  const showSelectActionBtns = editable;
  const handTable = getHandTable();

  if (!editable && onChange) {
    throw new Error("onChange is not allowed when editable is false");
  }

  const [selectedAction, setSelectedAction] = useState<ChartAction>(
    ChartActions.raise
  );

  const toggleActionToHand = (hand: ChartHand, selectedAction: ChartAction) => {
    const handAction = {
      ...value.find((item) => item.hand === hand),
    };
    const sameActionAsSelected = handAction?.action === selectedAction;

    if (!handAction) {
      const newHighlightedActions = [
        ...value,
        { hand, action: selectedAction },
      ];
      onChange?.(newHighlightedActions);
      return;
    }

    if (handAction) {
      // remove action from hand
      const newHighlightedActions = value.filter((item) => item.hand !== hand);

      if (!sameActionAsSelected) {
        // add selected action to hand
        newHighlightedActions.push({ hand, action: selectedAction });
      }
      onChange?.(newHighlightedActions);
    }
  };

  return (
    <div>
      {showSelectActionBtns && (
        <div className="flex justify-center gap-2 pb-5">
          {ChartActionsArray.map((action) => (
            <button
              className={`text-center border rounded-md p-2 cursor-pointer select-none ${
                selectedAction === action
                  ? "bg-white-300 border-black-500 border-2"
                  : `${getActionColor(action)} border-black-300`
              }`}
              key={action}
              onClick={() => setSelectedAction(action)}
            >
              {action[0].toUpperCase() + action.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}
      <table className="font-mono border-separate border-spacing-1 select-none">
        <tbody>
          {handTable.map((row, i) => (
            <tr key={`poker-hand-chart-row-${i}`}>
              {row.map((data, j) => (
                <td
                  onMouseDown={() => {
                    if (editable) {
                      toggleActionToHand(data, selectedAction);
                    }
                  }}
                  onMouseEnter={(e) => {
                    if (e.buttons === 1 && editable) {
                      toggleActionToHand(data, selectedAction);
                    }
                  }}
                  className={`w-10 h-10 text-center border rounded-md border-black-300 ${
                    editable ? "cursor-pointer" : ""
                  } ${
                    value.some((item) => item.hand === data)
                      ? getActionColor(
                          value.find((item) => item.hand === data)?.action ??
                            ChartActions.raise
                        )
                      : ""
                  }`}
                  key={`poker-hand-chart-data-${j}`}
                >
                  {data}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {showColorExplanation && (
        <div className="pt-2 flex flex-row gap-2">
          {ChartActionsArray.map((action) => (
            <div key={action} className="flex flex-row gap-2">
              <div className={`text-xl p-1 ${getActionColor(action)}`}>
                {action[0].toUpperCase() + action.slice(1).toLowerCase()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
