import StatIcon from "../StatIcon";
import type { Metric } from "./MonthCard";

export default function ActivityMetric({ label, value }: Metric) {
  return (
    <div key={label} className="flex items-start gap-3">
      <StatIcon attr={label} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  )
}