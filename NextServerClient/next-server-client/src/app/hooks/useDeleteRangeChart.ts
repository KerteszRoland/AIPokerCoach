"use client";

import { useState } from "react";
import axios from "axios";

export function useDeleteRangeChart() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteChart = async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/chart/${id}`);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteChart, loading, error };
}
