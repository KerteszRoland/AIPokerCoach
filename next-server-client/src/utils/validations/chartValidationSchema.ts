import {
  ChartActionsArray,
  ChartHand,
  ChartHandsArray,
  ChartTypesArray,
} from "@/config/chart";
import { PositionsArray } from "@/config/position";
import {
  RangeChart,
  RangeChartFull,
  RangeChartHand,
} from "@/server/serverRequests/chart";
import { z } from "zod";

export const chartHandValidationSchema = z.object({
  id: z.string(),
  rangeChartId: z.string(),
  hand: z.enum(ChartHandsArray),
  action: z.enum(ChartActionsArray),
}) satisfies z.ZodType<RangeChartHand>;

export const chartValidationSchema = z.object({
  id: z.string(),
  type: z.enum(ChartTypesArray),
  forPosition: z.enum(PositionsArray),
  againstPosition: z.enum(PositionsArray).nullable(),
}) satisfies z.ZodType<RangeChart>;

export const chartFullValidationSchema = chartValidationSchema.extend({
  hands: z.array(chartHandValidationSchema),
}) satisfies z.ZodType<RangeChartFull>;
