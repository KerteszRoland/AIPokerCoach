"use client";

import { useState, useEffect } from "react";
import { HandFull } from "@/app/serverUtils/serverRequests/hand";
import axios from "axios";

export function useHands({
  page,
  pageSize,
}: {
  page?: number;
  pageSize?: number;
} = {}) {
  const [hands, setHands] = useState<HandFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHands = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`/api/hand/`, {
          params: {
            page,
            pageSize,
          },
        });
        setHands(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchHands();
  }, [page, pageSize]);

  return { hands, loading, error };
}
