import type { Metric } from "../components/history/MonthCard";

export type Stress = "Relaxed" | "Normal" | "Exhausted" | "No Activity";

export type ApiResponse<T> = {
  message: string;
  data: T;
};

export interface Stat {
  "Screen Time": number;
  "Sleep Duration": number;
  "Caffeine Intake": number;
  "Mood": string;
  "Physical Activity": number;
  "Work Hours": number;
}

export type StatKey = keyof Stat;

export interface History {
  date: string;
  dateRaw: string;
  title: string;
  stressStatus: Stress;
  stressLevel: number;
  details: {
    label: StatKey;
    value: string;
  }[];
}

export const historySummaryLabels = [
  "Avg Screen Time",
  "Avg Sleep Duration",
  "Avg Exercise",
  "Stress Level",
] as const;

export type HistorySummaryLabel = typeof historySummaryLabels[number];
export type StatLabel = keyof Stat | HistorySummaryLabel;

export interface Histories {
  month: string;
  summary: {
    label: HistorySummaryLabel;
    value: string;
  }[];
  history: History[];
}

export interface User {
  id: number;
  name: string;
  username: string;
  emailAddress: string;
  bio?: string;
  biodata?: string;
  birthDate?: string;
  gender?: string;
  job?: string;
  workLocation?: string;
  hobby?: string;
}

export interface Friend extends User {
  status: Stress;
  stressStatus: Stress;
  time: string;
  stressLevel: Stress;
  lastActivityDate?: string | null;
}

export interface Socials {
  summary: {
    label: "Total Friends" | "Relaxed" | "Normal" | "Exhausted";
    value: number;
  }[];
  friends: Friend[];
}

export interface DashboardData {
  summary: Record<"Relaxed" | "Normal" | "Exhausted", number>;
  histories: History[];
}

export interface MonthData {
  month: string;
  monthPath: string;
  recordedDays: number;
  stressStatus: Stress;
  averageStress: string;
  metrics: Metric[];
}

export type LoaderData<T> = { data: T };

export type SocialProfile = {
  friend: Friend;
  histories: Histories;
};
