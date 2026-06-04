import type { History } from "../../utils/types"
import ActivityMetric from "../history/ActivityMetric"
import Modal from "../Modal"
import StressBadge from "../StressBadge"

export default function DetailActivity({ activeRecord, onClose }: {
  activeRecord?: History,
  onClose: () => void
}) {
  return (
    <Modal onClose={onClose} title={activeRecord?.date ?? "Daily Activity Detail"}>
        {activeRecord ? (
          <div className="space-y-5">
            <div className="flex flex-col gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {activeRecord.title}
                </p>
                <h3 className="mt-1 text-base font-semibold text-slate-900">
                  {activeRecord.date}
                </h3>
              </div>

              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <StressBadge label={activeRecord.stressStatus} />
                <div className="text-right">
                  <p className="text-xs text-slate-500">Stress Level</p>
                  <p className="text-xl font-bold text-slate-900">
                    {activeRecord.stressLevel}%
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeRecord.details.map((detail) => (
                <ActivityMetric label={detail.label} value={detail.value} />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No activity record found for this date.
          </p>
        )}
      </Modal>
  )
}