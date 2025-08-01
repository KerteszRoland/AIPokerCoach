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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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
      <Select
        value={forPosition}
        onValueChange={(value) => setForPosition(value as Position)}
      >
        <SelectTrigger id="position">
          <SelectValue placeholder="Select a position" />
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
          <SelectValue placeholder="Select a type" />
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
              <SelectValue placeholder="Select an against position" />
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
      <Button onClick={handleCreate} disabled={isPending} type="submit">
        {isPending ? "Creating..." : "Create"}
      </Button>
    </div>
  );
}
