import type { IconType } from "react-icons";
import type { Stress } from "../utils/types";
import { FaArrowTrendDown, FaArrowTrendUp, FaMinus } from "react-icons/fa6";

const badgeStyles: Record<Stress, {
  trendColor: string,
  icon: IconType
}> = {
  'Relaxed': {
    trendColor: 'text-emerald-500',
    icon: FaArrowTrendDown
  },
  'Normal': {
    trendColor: 'text-amber-500',
    icon: FaMinus
  },
  'Exhausted': {
    trendColor: 'text-rose-500',
    icon: FaArrowTrendUp
  },
  'No Activity': {
    trendColor: 'text-slate-400',
    icon: FaMinus
  },
}

export default function StressTrend({ label }: { label: Stress }) {
  const Icon = badgeStyles[label].icon
  return (
    <span className={`text-base font-semibold ${badgeStyles[label].trendColor}`}>
      <Icon />
    </span>
  )
}
