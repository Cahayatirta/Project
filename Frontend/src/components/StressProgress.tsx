import type { Stress } from "../utils/types";

const accents: Record<Stress, string> = {
  'Relaxed': 'bg-emerald-500',
  'Normal': 'bg-amber-500',
  'Exhausted': 'bg-rose-500',
  'No Activity': 'bg-slate-400',
}

export default function StressProgress({ label, stressLevel }: { label: Stress, stressLevel: number } ) {
  return (
    <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-200">
      <div
        className={`h-full rounded-full ${accents[label]}`}
        style={{ width: `${stressLevel}%` }}
      />
    </div>
  )
}
