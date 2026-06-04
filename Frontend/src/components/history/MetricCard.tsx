import StatIcon from "../StatIcon";
import type { Metric } from "./MonthCard";

export default function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div key={metric.label} className="flex items-start gap-3">
      <StatIcon attr={metric.label} />
      <div>
        <p className="text-xs text-slate-500">{metric.label}</p>
        <p className="text-sm font-bold text-slate-800">{metric.value}</p>
      </div>
    </div>
  )
}