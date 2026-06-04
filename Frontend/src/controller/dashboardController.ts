import api from "../utils/api";
import type { ApiResponse, DashboardData } from "../utils/types";

export async function dashboardLoader() {
  const { data: response } = await api.get<ApiResponse<DashboardData>>("/dashboard");
  return { data: response.data };
}
