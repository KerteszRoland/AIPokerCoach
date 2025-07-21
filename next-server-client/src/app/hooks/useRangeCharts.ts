"use client";

import { useState, useEffect } from "react";
import { RangeChartFull } from "@/app/serverUtils/serverRequests/chart";
import axios from "axios";
import { Position } from "../config/position";
import { ChartType } from "../config/chart";

export function useRangeCharts({
  page,
  pageSize,
  forPosition,
  againstPosition,
  type,
}: {
  page?: number;
  pageSize?: number;
  forPosition?: Position;
  againstPosition?: Position;
  type?: ChartType;
} = {}) {
  const [charts, setCharts] = useState<RangeChartFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChart = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/chart/`, {
          params: {
            page,
            pageSize,
            forPosition,
            againstPosition,
            type,
          },
        });
        setCharts(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchChart();
  }, [page, pageSize, forPosition, againstPosition, type]);

  return { charts, loading, error };
}
