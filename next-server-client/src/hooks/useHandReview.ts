"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "@/utils/axiosClient";
import {
  HandReview,
  handReviewSchema,
} from "@/utils/validations/handReviewValidationSchema";
import { AxiosError } from "axios";

export const useCreateHandReview = () =>
  useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      try {
        await axiosClient.post(`/hand/${id}/review`);
      } catch (error) {
        console.error("Failed to create hand review:", error);
        throw error;
      }
    },
  });

export const useGetHandReview = ({
  id,
  initialData,
}: {
  id: string;
  initialData?: HandReview;
}) =>
  useQuery({
    queryKey: ["handReview", id],
    queryFn: async (): Promise<HandReview | null> => {
      try {
        const res = await axiosClient.get(`/hand/${id}/review`);
        console.log("res", res.data);
        const parsedData = handReviewSchema.parse(res.data);
        return parsedData;
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return null;
        }

        console.error("Failed to get hand review:", error);
        throw error;
      }
    },
    enabled: !!id,
    initialData,
  });
