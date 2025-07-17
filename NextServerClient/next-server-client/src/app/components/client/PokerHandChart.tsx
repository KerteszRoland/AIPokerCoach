"use client";

import { useState } from "react";

function getHandTable(): string[][] {
  function indexToCard(index: number) {
    if (index < 0 || index > 12) {
      throw new Error("index parameter given is less than 0 or grater than 12");
    }
    let cards = [
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
  let handTable: string[][] = [];

  for (let i = 0; i < size; i++) {
    let row: string[] = [];
    for (let j = 0; j < size; j++) {
      row.push("o");
    }
    handTable.push(row);
  }

  //Suited hands
  // 0,1
  // 1,2
  // 2,3

  for (let i = 0; i < handTable.length; i++) {
    for (let j = i + 1; j < handTable[0].length; j++) {
      handTable[i][j] = `${indexToCard(i)}${indexToCard(j)}s`;
    }
  }

  // Pairs
  // 0,0
  // 1,1
  // 2,2
  for (let i = 0; i < handTable.length; i++) {
    handTable[i][i] = `${indexToCard(i)}${indexToCard(i)}`;
  }

  //Off suit hands
  // 1,0
  // 2,1
  // 3,2

  for (let i = 1; i < handTable.length; i++) {
    for (let j = 0; j < i; j++) {
      handTable[i][j] = `${indexToCard(j)}${indexToCard(i)}o`;
    }
  }
  return handTable;
}

type Action = {
  name: string;
  color: string;
};

const actions: Action[] = [
  { name: "raise", color: "bg-red-500" },
  { name: "call", color: "bg-green-500" },
  { name: "3-bet", color: "bg-blue-500" },
  { name: "4-bet", color: "bg-purple-500" },
];

export default function PokerHandChart() {
  const showSelectActionBtns = true;
  const handTable = getHandTable();

  const [selectedAction, setSelectedAction] = useState<Action>(actions[0]);

  const [highlightedActions, setHighlightedActions] = useState<
    {
      hand: string;
      action: Action;
    }[]
  >([]);

  const toggleActionToHand = (hand: string, selectedAction: Action) => {
    const handAction = {
      ...highlightedActions.find((item) => item.hand === hand),
    };
    const sameActionAsSelected = handAction?.action === selectedAction;

    if (!handAction) {
      setHighlightedActions([
        ...highlightedActions,
        { hand, action: selectedAction },
      ]);
      return;
    }

    if (handAction) {
      // remove action from hand
      let newHighlightedActions = highlightedActions.filter(
        (item) => item.hand !== hand
      );

      if (!sameActionAsSelected) {
        // add selected action to hand
        newHighlightedActions.push({ hand, action: selectedAction });
      }
      setHighlightedActions(newHighlightedActions);
    }
  };

  return (
    <div>
      {showSelectActionBtns && (
        <div className="flex justify-center gap-2 pb-5">
          {actions.map((action) => (
            <button
              className={`text-center border rounded-md p-2 cursor-pointer select-none ${
                selectedAction === action
                  ? "bg-white-300 border-black-500 border-2"
                  : `${action.color} border-black-300`
              }`}
              key={action.name}
              onClick={() => setSelectedAction(action)}
            >
              {action.name[0].toUpperCase() +
                action.name.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}
      <table className="font-mono border-separate border-spacing-1 cursor-pointer select-none">
        <tbody>
          {handTable.map((row, i) => (
            <tr key={`poker-hand-chart-row-${i}`}>
              {row.map((data, j) => (
                <td
                  onMouseDown={() => toggleActionToHand(data, selectedAction)}
                  onMouseEnter={(e) => {
                    if (e.buttons === 1) {
                      toggleActionToHand(data, selectedAction);
                    }
                  }}
                  className={`w-10 h-10 text-center border rounded-md border-black-300 ${
                    highlightedActions.some((item) => item.hand === data)
                      ? highlightedActions.find((item) => item.hand === data)
                          ?.action.color
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
    </div>
  );
}
