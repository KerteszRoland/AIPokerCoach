"use client";

import { Position, Positions, PositionsArray } from "@/app/config/position";
import { useEffect, useState } from "react";
import Button from "./Button";
import { ChartType, ChartTypes, ChartTypesArray } from "@/app/config/chart";
import { useRangeCharts } from "@/app/hooks/useRangeCharts";
import PokerHandChart from "./PokerHandChart";
import { useRecentHandViaSocket } from "@/app/hooks/useRecentHandViaSocket";
import { HandFull } from "@/app/serverUtils/serverRequests/hand";

export default function LiveRangeChart({
  initialHand,
}: {
  initialHand: HandFull | null;
}) {
  const { hand: previousHand } = useRecentHandViaSocket({
    initialHand,
  });
  const [forPosition, setForPosition] = useState<Position>(Positions.BTN);
  const [againstPosition, setAgainstPosition] = useState<Position>(
    forPosition === Positions.BTN ? Positions.UTG : Positions.BTN
  );
  const [auto, setAuto] = useState(true);
  const [type, setType] = useState<ChartType>(ChartTypes.rfi);

  const { charts } = useRangeCharts({
    page: 0,
    pageSize: 1,
    forPosition,
    againstPosition: ![ChartTypes.frfi, ChartTypes.bet3].includes(type)
      ? undefined
      : againstPosition,
    type,
  });

  useEffect(() => {
    if (previousHand) {
      const hero = previousHand.players.find((p) => p.isHero);
      if (!hero || (hero && hero.position === null)) {
        return;
      }

      const nextPosition =
        PositionsArray[
          (PositionsArray.indexOf(hero.position!) - 1) % PositionsArray.length
        ];
      setForPosition(nextPosition);
    }
  }, [previousHand]);

  const chart = charts.length > 0 ? charts[0] : null;

  return (
    <div className="flex flex-col items-end gap-4">
      <div className="flex items-center gap-2">
        <label htmlFor="position">Position</label>
        <select
          id="position"
          value={forPosition}
          onChange={(e) => setForPosition(e.target.value as Position)}
        >
          {PositionsArray.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
        <Button
          className={`${auto ? "bg-green-500" : "bg-red-500"}`}
          onClick={() => setAuto(!auto)}
        >
          Auto
        </Button>
      </div>
      <div className="flex flex-row gap-2">
        {ChartTypesArray.map((t) => (
          <Button
            key={t}
            className={`${type === t ? "bg-orange-500" : ""}`}
            onClick={() => setType(t)}
          >
            {t.toUpperCase()}
          </Button>
        ))}
      </div>
      {(type === ChartTypes.frfi || type === ChartTypes.bet3) && (
        <div className="flex flex-row gap-2">
          <label htmlFor="againstPosition">Against Position</label>
          <select
            id="againstPosition"
            value={againstPosition}
            onChange={(e) => setAgainstPosition(e.target.value as Position)}
          >
            {PositionsArray.filter((position) => position !== forPosition).map(
              (position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              )
            )}
          </select>
        </div>
      )}
      {chart && (
        <PokerHandChart
          value={chart.hands}
          editable={false}
          showColorExplanation
        />
      )}
    </div>
  );
}
