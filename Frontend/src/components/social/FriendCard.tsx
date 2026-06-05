import { Link } from "react-router";
import { FaChevronRight } from "react-icons/fa6";
import type { Friend } from "../../utils/types";
import { initials } from "../../utils/util";
import StressBadge from "../StressBadge";
import StressProgress from "../StressProgress";
import StressTrend from "../StressTrend";

export default function FriendCard({ friend }: { friend: Friend }) {
  const profileUrl = `/@${friend.username}`;
  console.log(friend);
  

  return (
    <div className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-md">
      <div className="flex flex-1 flex-col justify-between gap-1.5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-1.5 sm:gap-4">
          <Link
            to={profileUrl}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-slate-800 sm:size-12 sm:text-base"
          >
            {initials(friend.name)}
          </Link>
          <div className="flex w-full justify-between md:flex-col">
            <Link to={profileUrl} className="sm:text-lg font-semibold text-slate-800 hover:underline">
              {friend.name}
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <StressBadge label={friend.stressStatus} />
              <span className="text-[10px] sm:text-base">&bull; {friend.time}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end sm:gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Stress Level</span>
            <StressTrend label={friend.stressStatus} />
          </div>
          <div className="flex items-center gap-5">
            <StressProgress label={friend.stressStatus} stressLevel={friend.stressLevel ?? 0} />
          </div>
        </div>
      </div>
      <Link to={profileUrl}>
        <FaChevronRight />
      </Link>
    </div>
  );
}
