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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteModal from "../server/DeleteModal";

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
      <Select
        value={forPosition}
        onValueChange={(value) => setForPosition(value as Position)}
      >
        <SelectTrigger id="position">
          <SelectValue placeholder="Select position" />
        </SelectTrigger>
        <SelectContent>
          {PositionsArray.map((position) => (
            <SelectItem key={position} value={position}>
              {position}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <label htmlFor="type">Type</label>
      <Select
        value={type}
        onValueChange={(value) => {
          setType(value as ChartType);
          if (value !== ChartTypes.frfi && value !== ChartTypes.bet3) {
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
        <SelectTrigger id="type">
          <SelectValue placeholder="Select type" />
        </SelectTrigger>
        <SelectContent>
          {ChartTypesArray.map((type) => (
            <SelectItem key={type} value={type}>
              {type.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(type === ChartTypes.frfi || type === ChartTypes.bet3) && (
        <>
          <label htmlFor="againstPosition">Against Position</label>
          <Select
            value={againstPosition || ""}
            onValueChange={(value) => setAgainstPosition(value as Position)}
          >
            <SelectTrigger id="againstPosition">
              <SelectValue placeholder="Select against position" />
            </SelectTrigger>
            <SelectContent>
              {PositionsArray.filter(
                (position) => position !== forPosition
              ).map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          className="bg-green-500 text-foreground"
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update"}
        </Button>
        <DeleteModal
          title="Delete chart"
          description="Are you sure you want to delete this chart?"
          onConfirm={handleDelete}
          trigger={
            <Button
              className="bg-red-500 text-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          }
        />
      </div>
    </div>
  );
}
