import { CiCalendar } from "react-icons/ci"
import { FiUsers } from "react-icons/fi"

type pages = 'History' | 'Social'

const headlines = {
  'History': {
    icon: CiCalendar,
    text: 'Track your daily wellness activities'
  },
  'Social': {
    icon: FiUsers,
    text: `Track your friends' wellness journey`
  }
}

export default function PageHeadline({ page, title }: { page: pages, title?: string }) {
  const Icon = headlines[page].icon;
  return (
    <div className="flex gap-4">
      <div className="size-12 rounded-xl flex justify-center items-center bg-white shadow-md">
        <Icon className="size-6 text-primary-700" />
      </div>
      <div className="">
        <h3 className="text-2xl font-semibold">{ title ?? page }</h3>
        <p>{ headlines[page].text }</p>
      </div>
    </div>
  )
}