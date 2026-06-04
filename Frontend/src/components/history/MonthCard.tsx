import type { ComponentProps } from "react";
import { Link } from "react-router";
import { CiCalendar } from "react-icons/ci";
import { IoChevronForward } from "react-icons/io5";
import StressBadge from "../StressBadge";
import type { MonthData, StatLabel } from "../../utils/types";
import MetricCard from "./MetricCard";

export type Metric = {
  label: StatLabel,
  value: string
};

type MonthCardProps = ComponentProps<"article"> & {
  monthData: MonthData;
  // metrics?: Metric[];
  detailPath?: string;
};

export default function MonthCard({
  monthData,
  detailPath,
  className,
  ...props
}: MonthCardProps) {
  return (
    <article
      className={`rounded-xl bg-white px-5 py-4 font-poppins shadow-md ring-1 ring-slate-100 sm:px-6${className ? ` ${className}` : ""}`}
      {...props}
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            <CiCalendar className="size-6" />
          </div>

          <div>
            <h3 className="text-base font-semibold leading-tight text-slate-800 sm:text-lg">
              {monthData.month}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{monthData.recordedDays} hari tercatat</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <StressBadge label={monthData.stressStatus} />

          <div className="text-right">
            <p className="text-xs text-slate-500">Rata-rata Stress</p>
            <p className="text-lg font-bold leading-tight text-slate-800">{monthData.averageStress}</p>
          </div>

          <Link
            to={detailPath ?? "/history/2026-04"}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-700"
            aria-label={`Lihat detail ${monthData.month}`}
          >
            <IoChevronForward className="size-5" />
          </Link>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
        {monthData.metrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}
      </div>
    </article>
  );
}
