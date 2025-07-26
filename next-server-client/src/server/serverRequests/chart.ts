import db from "../db";
import { RangeCharts, RangeChartHands } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Position } from "@/config/position";
import { ChartAction, ChartHand, ChartType } from "@/config/chart";
import { getServerSession } from "next-auth";
import { getUserIdFromSession } from "../getUserIdFromSession";

export type RangeChart = {
  id: string;
  type: ChartType;
  forPosition: Position;
  againstPosition: Position | null;
};

export type RangeChartHand = {
  id: string;
  rangeChartId: string;
  hand: ChartHand;
  action: ChartAction;
};

export type RangeChartFull = RangeChart & {
  hands: RangeChartHand[];
};

export type RangeChartHandCreateDTO = {
  hand: ChartHand;
  action: ChartAction;
};

export type RangeChartCreateDTO = {
  type: ChartType;
  forPosition: Position;
  againstPosition: Position | null;
  hands: RangeChartHandCreateDTO[];
};

export type RangeChartUpdateDTO = {
  type?: ChartType;
  forPosition?: Position;
  againstPosition?: Position | null;
  hands?: RangeChartHandCreateDTO[];
};

export function RangeChartFromDb(
  dbChart: typeof RangeCharts.$inferSelect
): RangeChart {
  return {
    id: dbChart.id,
    type: dbChart.type as ChartType,
    forPosition: dbChart.forPosition as Position,
    againstPosition: dbChart.againstPosition as Position | null,
  };
}

export function RangeChartFullFromDb(
  dbChart: typeof RangeCharts.$inferSelect & {
    hands: (typeof RangeChartHands.$inferSelect)[];
  }
): RangeChartFull {
  return {
    id: dbChart.id,
    type: dbChart.type as ChartType,
    forPosition: dbChart.forPosition as Position,
    againstPosition: dbChart.againstPosition as Position | null,
    hands: dbChart.hands.map(RangeChartHandFromDb) as RangeChartHand[],
  };
}

export function RangeChartHandFromDb(
  dbHand: typeof RangeChartHands.$inferSelect
): RangeChartHand {
  return {
    id: dbHand.id,
    rangeChartId: dbHand.rangeChartId,
    hand: dbHand.hand as ChartHand,
    action: dbHand.action as ChartAction,
  };
}

export async function createRangeChart({
  type,
  forPosition,
  againstPosition,
  hands,
}: RangeChartCreateDTO): Promise<RangeChartFull> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const charts = await db
    .insert(RangeCharts)
    .values({
      id: crypto.randomUUID(),
      type,
      forPosition,
      againstPosition,
      userId,
    })
    .returning();

  if (!charts || charts?.length === 0) {
    throw new Error("Failed to create range chart");
  }

  const chart = RangeChartFromDb(charts[0]);

  const chartHands = await db
    .insert(RangeChartHands)
    .values(
      hands.map((hand) => ({
        id: crypto.randomUUID(),
        rangeChartId: chart.id,
        hand: hand.hand,
        action: hand.action,
      }))
    )
    .returning();

  if (!chartHands || chartHands?.length === 0) {
    throw new Error("Failed to create range chart hands");
  }

  const fullChart = await getRangeChartById({ id: chart.id });

  if (!fullChart) {
    throw new Error("Failed to create range chart");
  }

  return fullChart;
}

export async function getRangeChartById({
  id,
}: {
  id: string;
}): Promise<RangeChartFull | null> {
  const chart = await db.query.RangeCharts.findFirst({
    where: eq(RangeCharts.id, id),
    with: {
      hands: true,
    },
  });

  return chart ? RangeChartFullFromDb(chart) : null;
}

export async function updateRangeChart({
  id,
  data,
}: {
  id: string;
  data: RangeChartUpdateDTO;
}): Promise<void> {
  const chartResult = await db
    .update(RangeCharts)
    .set({
      type: data.type as ChartType,
      forPosition: data.forPosition
        ? (data.forPosition as Position)
        : undefined,
      againstPosition: data.againstPosition
        ? (data.againstPosition as Position)
        : undefined,
    })
    .where(eq(RangeCharts.id, id));

  if (chartResult.rowCount === 0) {
    throw new Error("Failed to update range chart");
  }

  // replace hands
  if (data.hands) {
    await db
      .delete(RangeChartHands)
      .where(eq(RangeChartHands.rangeChartId, id));
    await db.insert(RangeChartHands).values(
      data.hands.map((hand) => ({
        id: crypto.randomUUID(),
        rangeChartId: id,
        hand: hand.hand,
        action: hand.action,
      }))
    );
  }
}

export async function deleteRangeChart(id: string): Promise<void> {
  const result = await db.delete(RangeCharts).where(eq(RangeCharts.id, id));
  if (result.rowCount === 0) {
    throw new Error("Failed to delete range chart");
  }
}

export async function getRangeCharts({
  page = 1,
  pageSize = 100,
}: {
  page?: number;
  pageSize?: number;
} = {}): Promise<{ charts: RangeChartFull[]; total: number }> {
  const userId = await getUserIdFromSession();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const offset = (page - 1) * pageSize;
  const charts = await db.query.RangeCharts.findMany({
    with: {
      hands: true,
    },
    limit: pageSize,
    offset,
    where: eq(RangeCharts.userId, userId),
  });

  return {
    charts: charts.map(RangeChartFullFromDb),
    total: charts.length,
  };
}
