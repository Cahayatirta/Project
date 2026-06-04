import { FaArrowTrendUp, FaCircleInfo } from "react-icons/fa6"
import { IoMoonOutline } from "react-icons/io5"
import { LuMonitor } from "react-icons/lu"
import type { HistorySummaryLabel } from "../../utils/types"
import type { IconType } from "react-icons"

const icons: Record<HistorySummaryLabel, IconType> = {
  'Avg Screen Time': LuMonitor,
  'Avg Sleep Duration': IoMoonOutline,
  'Avg Exercise': FaArrowTrendUp,
  'Stress Level': LuMonitor,
}

export default function AverageCard({ attribute, value }: {attribute?: HistorySummaryLabel, value: string}) {
  const Icon = attribute ? icons[attribute] : FaCircleInfo;
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="flex gap-3 items-center">
        <Icon className="text-primary-600" />
        { attribute }
      </div>
      <h3 className="text-2xl font-semibold mt-2">{ value }</h3>
    </div>
  )
}
