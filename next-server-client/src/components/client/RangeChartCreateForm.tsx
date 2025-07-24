"use client";

import { useState } from "react";
import PokerHandChart from "./PokerHandChart";
import { useCreateRangeChart } from "@/hooks/useRangeChart";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { Positions, Position, PositionsArray } from "@/config/position";
import {
  ChartType,
  ChartAction,
  ChartHand,
  ChartTypes,
  ChartTypesArray,
} from "@/config/chart";
import { RangeChartCreateDTO } from "@/server/serverRequests/chart";

export default function RangeChartCreateForm() {
  const router = useRouter();
  const { mutate: createRangeChart, isPending } = useCreateRangeChart();
  const [type, setType] = useState<ChartType>(ChartTypes.rfi);
  const [forPosition, setForPosition] = useState<Position>(Positions.BTN);
  const [againstPosition, setAgainstPosition] = useState<Position | null>(
    Positions.BTN
  );
  const [chartActions, setChartActions] = useState<
    { hand: ChartHand; action: ChartAction }[]
  >([]);

  const handleCreate = async () => {
    const newChartRange: RangeChartCreateDTO = {
      type,
      forPosition,
      againstPosition: ![ChartTypes.frfi, ChartTypes.bet3].includes(type)
        ? null
        : againstPosition || null,
      hands: chartActions,
    };

    createRangeChart(
      { data: newChartRange },
      {
        onSuccess: (data) => {
          router.push(`/pokerHandChart/${data.id}`);
        },
        onError: (error) => {
          console.error(error);
        },
      }
    );
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
        {PositionsArray.map((position) => (
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
          if (
            (e.target.value as ChartType) !== ChartTypes.frfi &&
            (e.target.value as ChartType) !== ChartTypes.bet3
          ) {
            setAgainstPosition(null);
          } else {
            if (forPosition === Positions.BTN) {
              setAgainstPosition(Positions.SB);
            } else {
              setAgainstPosition(Positions.BTN);
            }
          }
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
            value={againstPosition || ""}
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
        </>
      )}
      <PokerHandChart
        value={chartActions}
        onChange={setChartActions}
        editable
      />
      <Button onClick={handleCreate} disabled={isPending} type="submit">
        {isPending ? "Creating..." : "Create"}
      </Button>
    </div>
  );
}
