"use client";

import { useState } from "react";
import PokerHandChart from "./PokerHandChart";
import {
  RangeChartFull,
  RangeChartUpdateDTO,
} from "@/server/serverRequests/chart";
import { useRouter } from "next/navigation";
import {
  useDeleteRangeChart,
  useUpdateRangeChart,
} from "@/hooks/useRangeChart";
import Button from "./Button";
import { Position, Positions, PositionsArray } from "@/config/position";
import {
  ChartAction,
  ChartHand,
  ChartType,
  ChartTypes,
  ChartTypesArray,
} from "@/config/chart";

export default function RangeChartUpdateForm({
  chart,
}: {
  chart: RangeChartFull;
}) {
  const router = useRouter();
  const { mutate: updateRangeChart, isPending: isUpdating } =
    useUpdateRangeChart();
  const { mutate: deleteRangeChart, isPending: isDeleting } =
    useDeleteRangeChart();
  const [type, setType] = useState<ChartType>(chart.type);
  const [forPosition, setForPosition] = useState<Position>(chart.forPosition);
  const [againstPosition, setAgainstPosition] = useState<Position | null>(
    chart.againstPosition ||
      (forPosition === Positions.BTN ? Positions.SB : Positions.BTN)
  );
  const [chartActions, setChartActions] = useState<
    { hand: ChartHand; action: ChartAction }[]
  >(chart.hands.map((hand) => ({ hand: hand.hand, action: hand.action })));

  const handleUpdate = async () => {
    const updatedChartRange: RangeChartUpdateDTO = {
      type,
      forPosition,
      againstPosition: ![ChartTypes.frfi, ChartTypes.bet3].includes(type)
        ? null
        : againstPosition || null,
      hands: chartActions,
    };

    updateRangeChart(
      { id: chart.id, data: updatedChartRange },
      {
        onSuccess: () => {
          router.push(`/pokerHandChart/${chart.id}`);
        },
        onError: (error) => {
          console.error(error);
        },
      }
    );
  };

  const handleDelete = async () => {
    deleteRangeChart(
      { id: chart.id },
      {
        onSuccess: () => {
          router.push("/pokerHandChart");
        },
        onError: (error) => {
          console.error(error);
        },
      }
    );
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
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={handleUpdate}
          className="bg-green-500"
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update"}
        </Button>
        <Button
          onClick={handleDelete}
          className="bg-red-500"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  );
}
