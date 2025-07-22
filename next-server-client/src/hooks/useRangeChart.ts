"use client";

import {
  RangeChartCreateDTO,
  RangeChartFull,
  RangeChartUpdateDTO,
} from "@/server/serverRequests/chart";
import { useMutation, useQuery } from "@tanstack/react-query";
import axiosClient from "@/utils/axiosClient";
import { Position } from "@/config/position";
import { ChartType } from "@/config/chart";
import { chartFullValidationSchema } from "@/utils/validations/chartValidationSchema";

export const useCreateRangeChart = () =>
  useMutation({
    mutationFn: async ({
      data,
    }: {
      data: RangeChartCreateDTO;
    }): Promise<RangeChartFull> => {
      try {
        const res = await axiosClient.post("/chart", data);
        const parsedData = chartFullValidationSchema.parse(res.data);
        return parsedData;
      } catch (error) {
        console.error("Failed to create range chart:", error);
        throw error;
      }
    },
  });

export const useUpdateRangeChart = () =>
  useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: RangeChartUpdateDTO;
    }): Promise<void> => {
      try {
        const res = await axiosClient.put(`/chart/${id}`, data);
        if (res.status !== 204) {
          throw new Error("Failed to update range chart");
        }
      } catch (error) {
        console.error("Failed to update range chart:", error);
        throw error;
      }
    },
  });

export const useDeleteRangeChart = () =>
  useMutation({
    mutationFn: async ({ id }: { id: string }): Promise<void> => {
      try {
        const res = await axiosClient.delete(`/chart/${id}`);
        if (res.status !== 204) {
          throw new Error("Failed to delete range chart");
        }
      } catch (error) {
        console.error("Failed to delete range chart:", error);
        throw error;
      }
    },
  });

export const useGetRangeChartById = ({ id }: { id: string }) =>
  useQuery({
    queryKey: ["rangeChart", id],
    queryFn: async (): Promise<RangeChartFull> => {
      try {
        const res = await axiosClient.get(`/chart/${id}`);
        const parsedData = chartFullValidationSchema.parse(res.data);
        return parsedData;
      } catch (error) {
        console.error("Failed to get range chart by id:", error);
        throw error;
      }
    },
    enabled: !!id,
  });

export const useGetRangeCharts = ({
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
}) =>
  useQuery({
    queryKey: [
      "rangeCharts",
      page,
      pageSize,
      forPosition,
      againstPosition,
      type,
    ],
    queryFn: async (): Promise<RangeChartFull[]> => {
      try {
        const { data } = await axiosClient.get(`/chart`, {
          params: {
            page,
            pageSize,
            forPosition,
            againstPosition,
            type,
          },
        });
        const parsedData = chartFullValidationSchema.array().parse(data);
        return parsedData;
      } catch (error) {
        console.error("Failed to get range charts:", error);
        throw error;
      }
    },
  });
