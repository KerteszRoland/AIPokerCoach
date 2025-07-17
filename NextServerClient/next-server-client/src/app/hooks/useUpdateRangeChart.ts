"use client";

import { useState } from "react";
import { RangeChartUpdateDTO } from "@/app/serverUtils/serverRequests/chart";
import axios from "axios";

export function useUpdateRangeChart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (
    id: string,
    data: RangeChartUpdateDTO
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(`/api/chart/${id}`, data);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { update, loading, error };
}
