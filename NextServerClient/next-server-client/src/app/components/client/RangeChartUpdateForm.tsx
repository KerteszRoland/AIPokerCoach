"use client";

import { useState } from "react";
import PokerHandChart from "./PokerHandChart";
import { useUpdateRangeChart } from "@/app/hooks/useUpdateRangeChart";
import { RangeChartFull } from "@/app/serverUtils/serverRequests/chart";
import { useRouter } from "next/navigation";
import { useDeleteRangeChart } from "@/app/hooks/useDeleteRangeChart";
import Button from "./Button";
import { isValidPosition, Position, Positions } from "@/app/config/position";
import {
  ChartAction,
  ChartHand,
  ChartType,
  ChartTypes,
  ChartTypesArray,
} from "@/app/config/chart";

export default function RangeChartUpdateForm({
  chart,
}: {
  chart: RangeChartFull;
}) {
  const router = useRouter();
  const { update: updateRangeChart } = useUpdateRangeChart();
  const { deleteChart: deleteRangeChart } = useDeleteRangeChart();
  const [type, setType] = useState<ChartType>(chart.type);
  const [forPosition, setForPosition] = useState<Position>(chart.forPosition);
  const [againstPosition, setAgainstPosition] = useState<Position | undefined>(
    chart.againstPosition
  );
  const [chartActions, setChartActions] = useState<
    { hand: ChartHand; action: ChartAction }[]
  >(chart.hands.map((hand) => ({ hand: hand.hand, action: hand.action })));

  const handleUpdate = async () => {
    if (!isValidPosition(forPosition)) {
      throw new Error("Invalid position");
    }

    if (chart.againstPosition && !isValidPosition(chart.againstPosition)) {
      throw new Error("Invalid against position");
    }
    console.log("againstPosition", againstPosition);
    const updatedChart = await updateRangeChart(chart.id, {
      type,
      forPosition,
      againstPosition,
      hands: chartActions,
    });
    if (!updatedChart) {
      throw new Error("Failed to update chart");
    }
    router.push(`/pokerHandChart/${chart.id}`);
  };

  const handleDelete = async () => {
    await deleteRangeChart(chart.id);
    router.push("/pokerHandChart");
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">{"Update chart #" + chart.id}</h1>
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
          if (
            (e.target.value as ChartType) !== ChartTypes.frfi &&
            (e.target.value as ChartType) !== ChartTypes.bet3
          ) {
            setAgainstPosition(undefined);
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
      <div className="flex flex-col items-center gap-4">
        <Button onClick={handleUpdate} className="bg-green-500">
          Update
        </Button>
        <Button onClick={handleDelete} className="bg-red-500">
          Delete
        </Button>
      </div>
    </div>
  );
}
