"use client";

import { useState, useEffect } from "react";
import { RangeChartFull } from "@/app/serverUtils/serverRequests/chart";
import axios from "axios";

export function useRangeChart(id: string) {
  const [chart, setChart] = useState<RangeChartFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChart = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/chart/${id}`);
        setChart(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchChart();
  }, [id]);

  return { chart, loading, error };
}
