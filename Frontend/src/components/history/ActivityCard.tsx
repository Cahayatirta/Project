import { CiCalendar } from "react-icons/ci";
import type { History } from "../../utils/types";
import StressBadge from "../StressBadge";
import ActivityMetric from "./ActivityMetric";

export default function ActivityCard({ history }: {history: History}) {
  return (
    <article
      key={history.date}
      className="rounded-xl bg-white p-5 shadow-md"
    >
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
            <CiCalendar className="size-6" />
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-800">{history.date}</h4>
            <p className="text-sm text-slate-500">{history.title}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-4">
          <StressBadge label={history.stressStatus} />
          <div className="text-right text-xs text-slate-500">
            <p>Stress Level</p>
            <p className="text-lg font-bold text-slate-800">{history.stressLevel}%</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-5 lg:grid-cols-3">
        {history.details.map((detail) => (
          <ActivityMetric label={detail.label} value={detail.value} />
        ))}
      </div>
    </article>
  )
}