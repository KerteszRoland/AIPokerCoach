"use client";

import { useState } from "react";
import PokerHandChart from "./PokerHandChart";
import { useCreateRangeChart } from "@/app/hooks/useCreateRangeChart";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { isValidPosition, Positions } from "@/app/config/position";
import {
  ChartType,
  ChartAction,
  ChartHand,
  ChartTypes,
  ChartTypesArray,
} from "@/app/config/chart";
import { Position } from "@/app/config/position";

export default function RangeChartCreateForm() {
  const router = useRouter();
  const { create: createRangeChart } = useCreateRangeChart();
  const [type, setType] = useState<ChartType>(ChartTypes.rfi);
  const [forPosition, setForPosition] = useState<Position>("BTN");
  const [againstPosition, setAgainstPosition] = useState<Position | undefined>(
    undefined
  );
  const [chartActions, setChartActions] = useState<
    { hand: ChartHand; action: ChartAction }[]
  >([]);

  const handleCreate = async () => {
    if (!isValidPosition(forPosition)) {
      throw new Error("Invalid position");
    }

    const chart = await createRangeChart({
      type,
      forPosition,
      againstPosition,
      hands: chartActions,
    });
    if (chart) {
      router.push(`/pokerHandChart/${chart.id}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">{"Create a new chart"}</h1>
      <label htmlFor="position">Position</label>
      <select
        id="position"
        value={forPosition}
        onChange={(e) => setForPosition(e.target.value as Position)}
      >
        {Positions.map((position) => (
          <option key={position} value={position}>
            {position}
          </option>
        ))}
      </select>
      <label htmlFor="type">Type</label>
      <select
        id="type"
        value={type}
        onChange={(e) => {
          setType(e.target.value as ChartType);
          setAgainstPosition(undefined);
        }}
      >
        {ChartTypesArray.map((type) => (
          <option key={type} value={type}>
            {type.toUpperCase()}
          </option>
        ))}
      </select>
      {(type === ChartTypes.frfi || type === ChartTypes.bet3) && (
        <>
          <label htmlFor="againstPosition">Against Position</label>
          <select
            id="againstPosition"
            value={againstPosition}
            onChange={(e) => setAgainstPosition(e.target.value as Position)}
          >
            {Positions.filter((position) => position !== forPosition).map(
              (position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              )
            )}
          </select>
        </>
      )}
      <PokerHandChart
        value={chartActions}
        onChange={setChartActions}
        editable
      />
      <Button onClick={handleCreate}>Create</Button>
    </div>
  );
}
