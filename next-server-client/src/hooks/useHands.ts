"use client";

import { useQuery } from "@tanstack/react-query";
import axiosClient from "@/utils/axiosClient";
import { handFullValidationSchema } from "@/utils/validations/handValidationSchema";
import { HandFull } from "@/server/serverRequests/hand";

export const useGetHands = ({
  page,
  pageSize,
  initialData,
}: {
  page?: number;
  pageSize?: number;
  initialData?: HandFull[];
}) =>
  useQuery({
    queryKey: ["hands", page, pageSize],
    queryFn: async (): Promise<HandFull[]> => {
      try {
        const { data } = await axiosClient.get(`/hand`, {
          params: { page, pageSize },
        });
        const parsedData = handFullValidationSchema.array().parse(data);
        return parsedData;
      } catch (error) {
        console.error("Failed to get hands:", error);
        throw error;
      }
    },
    initialData,
  });
