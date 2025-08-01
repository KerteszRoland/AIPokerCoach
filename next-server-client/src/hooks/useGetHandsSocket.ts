"use client";

import { HandFull } from "@/server/serverRequests/hand";
import { useGetHands } from "./useHands";
import { useHandNotification } from "./useHandNotification";

export function useGetHandsSocket({
  initialHands,
  options,
}: {
  initialHands: HandFull[];
  options?: {
    pageSize?: number;
  };
}) {
  const {
    data: hands,
    isLoading,
    error,
    refetch,
  } = useGetHands({
    page: 0,
    pageSize: options?.pageSize ?? 30,
    initialData: initialHands,
  });

  useHandNotification({
    onNewHand: () => {
      refetch();
    },
  });

  return { hands, isLoading, error };
}
