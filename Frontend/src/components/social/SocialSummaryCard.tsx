import type { Socials } from "../../utils/types";

export default function SocialSummaryCard({ stat }: { stat: Socials['summary'][number] }) {
  return (
    <div className="p-4 rounded-xl bg-white col-span-3 md:col-span-2">
      <div className="">{stat.label}</div>
      <h3 className="text-3xl font-semibold">{stat.value}</h3>
    </div>
  )
}