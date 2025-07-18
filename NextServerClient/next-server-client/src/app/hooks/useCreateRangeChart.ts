"use client";

import { useState } from "react";
import {
  RangeChartCreateDTO,
  RangeChartFull,
} from "@/app/serverUtils/serverRequests/chart";
import axios from "axios";

export function useCreateRangeChart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (
    data: RangeChartCreateDTO
  ): Promise<RangeChartFull | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/chart", data);
      return res.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { create, loading, error };
}
