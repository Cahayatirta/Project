import type { LoaderFunctionArgs } from "react-router";
import api from "../utils/api";
import type { ApiResponse, Histories, MonthData } from "../utils/types";

type MonthApiResponse = Omit<MonthData, "averageStress"> & {
  metrics: { label: string; value: string }[];
};

export async function allHistory() {
  const { data: response } = await api.get<ApiResponse<MonthApiResponse[]>>("/activities/months");

  const histories: MonthData[] = response.data.map((item) => ({
    ...item,
    averageStress: item.metrics.find((metric) => metric.label === "Stress Level")?.value ?? "-",
  }));

  return { data: histories };
}

export async function detailHistory({ params }: LoaderFunctionArgs) {
  const { bulan } = params;

  if (!bulan || !/^\d{4}-\d{2}$/.test(bulan)) {
    throw new Response("Format bulan tidak valid", { status: 400 });
  }

  const { data: response } = await api.get<ApiResponse<Histories>>(`/activities/months/detail?month=${bulan}`);
  return { data: response.data };
}
