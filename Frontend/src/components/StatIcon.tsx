import type { StatLabel } from "../utils/types";
import AttributeIcon from "./AtrributeIcon";

const stats = {
  "Screen Time": { tone: "text-blue-600", bg: "bg-blue-50" },
  "Sleep Duration": { tone: "text-indigo-600", bg: "bg-indigo-50" },
  "Physical Activity": { tone: "text-emerald-600", bg: "bg-emerald-50" },
  "Caffeine Intake": { tone: "text-orange-600", bg: "bg-orange-50" },
  "Mood": { tone: "text-amber-600", bg: "bg-amber-50" },
  "Work Hours": { tone: "text-purple-600", bg: "bg-purple-50" },
  'Avg Sleep Duration': { tone: "text-indigo-600", bg: "bg-indigo-50" },
  'Avg Screen Time': { tone: "text-blue-600", bg: "bg-blue-50" },
  'Avg Exercise': { tone: "text-emerald-600", bg: "bg-emerald-50" },
  'Stress Level': { tone: "text-cyan-600", bg: "bg-cyan-50" },
};

interface IconDisplayProps extends React.ComponentProps<'div'> {
  attr: StatLabel;
}

export default function StatIcon({ attr, ...params }: IconDisplayProps) {
  return (
    <div className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${stats[attr].bg}${params.className ? ` ${params.className}` : ''}`} {...params}>
      <AttributeIcon attr={attr} className={`size-4 ${stats[attr].tone}`} />
    </div>
  )
}
