import { Link, useLoaderData } from "react-router";
import type { ReactNode } from "react";
import { FaArrowLeft, FaBriefcase, FaEnvelope, FaHeart, FaLocationDot } from "react-icons/fa6";
import ActivityCard from "../components/history/ActivityCard";
import AverageCard from "../components/history/AverageCard";
import PageHeadline from "../components/PageHeadline";
import StressBadge from "../components/StressBadge";
import StressProgress from "../components/StressProgress";
import type { LoaderData, SocialProfile } from "../utils/types";
import { initials } from "../utils/util";

function ProfileMeta({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-100 bg-white p-3">
      <div className="mt-0.5 text-primary-700">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function SocialDetail() {
  const { data: profile } = useLoaderData() as LoaderData<SocialProfile>;
  const { friend, histories } = profile;

  return (
    <div className="container mx-auto mt-8 max-w-4xl px-4 pb-10">
      <Link to="/social" className="mb-4 inline-flex items-center gap-4 border-b border-transparent text-slate-600 hover:border-slate-600">
        <FaArrowLeft />
        Back to social
      </Link>

      <section className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="bg-primary-100 px-6 py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-primary text-2xl font-bold text-slate-900 ring-4 ring-white">
                {initials(friend.name)}
              </div>
              <div>
                <p className="text-sm font-medium text-primary-800">@{friend.username}</p>
                <h1 className="text-3xl font-semibold text-slate-950">{friend.name}</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-700">{profile.friend.bio}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 rounded-md bg-white/80 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <StressBadge label={friend.status} />
                <span className="text-xs text-slate-500">{friend.time}</span>
              </div>
              <div className="flex items-center gap-3">
                <StressProgress label={friend.status} stressLevel={friend.stressLevel} />
                <span className="text-sm font-bold text-slate-900">{friend.stressLevel}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 p-6 sm:grid-cols-2">
          <ProfileMeta icon={<FaEnvelope />} label="Email" value={friend.emailAddress} />
          <ProfileMeta icon={<FaBriefcase />} label="Job" value={friend.job} />
          <ProfileMeta icon={<FaLocationDot />} label="Work Location" value={friend.workLocation} />
          <ProfileMeta icon={<FaHeart />} label="Hobby" value={friend.hobby} />
        </div>
      </section>

      <section className="mt-8">
        <div className="flex justify-between gap-6">
          <PageHeadline page="Social" title={`${friend.name}'s Activity in ${histories.month}`} />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {histories.summary.map((average) => (
            <AverageCard key={average.label} attribute={average.label} value={average.value} />
          ))}
        </div>

        <div className="histories mt-8 flex flex-col gap-4">
          {histories.history.map((history) => (
            <ActivityCard key={history.dateRaw} history={history} />
          ))}
        </div>
      </section>
    </div>
  );
}
