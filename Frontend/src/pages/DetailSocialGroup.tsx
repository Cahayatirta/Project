import { Link, useLoaderData } from "react-router";
import { FaArrowLeft, FaUserGroup, FaUsers } from "react-icons/fa6";
import FriendCard from "../components/social/FriendCard";
import PageHeadline from "../components/PageHeadline";
import SocialSummaryCard from "../components/social/SocialSummaryCard";
import type { LoaderData } from "../utils/types";
import type { SocialGroupDetail } from "../controller/socialGroupController";

export default function DetailSocialGroup() {
  const { data } = useLoaderData() as LoaderData<SocialGroupDetail>;
  console.log(data);
  const { group, summary, friends } = data;

  return (
    <div className="container mx-auto mt-8 max-w-4xl px-4 pb-10">
      <Link
        to="/social/groups"
        className="mb-4 inline-flex items-center gap-3 border-b border-transparent text-slate-600 hover:border-slate-600"
      >
        <FaArrowLeft />
        Back to groups
      </Link>

      <section className="overflow-hidden rounded-xl bg-white shadow-md">
        <div className="bg-primary-100 px-6 py-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <PageHeadline page="Social" title={group.groupName} />
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                {group.description}
              </p>
            </div>
            <div className="flex w-fit items-center gap-3 rounded-md bg-white/80 px-4 py-3 font-semibold text-primary-800 shadow-sm">
              <FaUsers />
              {group.members} members
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-900">
                <FaUserGroup />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Group activity</p>
                <p className="text-sm text-slate-500">
                  Monitor friends in this circle and their latest wellbeing status.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-primary-700 p-4 text-white">
            <p className="text-sm text-primary-100">Group slug</p>
            <p className="mt-1 font-semibold">{group.slug}</p>
          </div>
        </div>
      </section>

      <div className="mt-8 grid grid-cols-8 gap-6">
        {summary.map((stat) => (
          <SocialSummaryCard key={stat.label} stat={stat} />
        ))}
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-950">Friends</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
            {friends.length} listed
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {friends.map((friend) => (
            <FriendCard key={friend.id} friend={friend} />
          ))}
        </div>
      </section>
    </div>
  );
}
