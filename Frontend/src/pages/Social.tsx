import { FaPlus, FaUserShield, FaUsers } from "react-icons/fa6";
import Button from "../components/Button";
import { useState } from "react";
import type { LoaderData, Socials } from "../utils/types";
import SocialSummaryCard from "../components/social/SocialSummaryCard";
import FriendCard from "../components/social/FriendCard";
import PageHeadline from "../components/PageHeadline";
import { Link, useLoaderData } from "react-router";
import AddFriend from "../components/social/AddFriend";
import ChangePermission from "../components/social/ChangePermission";

export default function Social() {
  const { data: socials } = useLoaderData() as LoaderData<Socials>;
  console.log(socials);
  
  const [openNewFriend, setOpenNewFriend] = useState(false);
  const [openPermission, setOpenPermission] = useState(false);

  return (
    <>
      <div className="container max-w-4xl mx-auto mt-8 px-4 pb-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <PageHeadline page="Social" />
          <div className="grid w-full grid-cols-1 gap-3 sm:w-auto sm:grid-cols-3">
            <Button
              type="button"
              className="justify-center whitespace-nowrap"
              onClick={() => setOpenNewFriend(true)}
            >
              <FaPlus />
              Add Friend
            </Button>
            <Button
              type="button"
              className="justify-center whitespace-nowrap bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
              onClick={() => setOpenPermission(true)}
            >
              <FaUserShield />
              Permission
            </Button>
            <Link
              to="/social/groups"
              className="flex items-center justify-center gap-3 whitespace-nowrap rounded bg-primary-600 px-4 py-2 font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              <FaUsers />
              Groups
            </Link>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-8 gap-6">
          { socials.summary.map((stat, i) => <SocialSummaryCard key={i} stat={stat} />) }
        </div>
        <div className="list-friends mt-8 flex flex-col gap-4">
        {socials.friends.map((friend) => (
          <FriendCard key={friend.id} friend={friend} />
        ))}
        </div>
      </div>
      {openNewFriend && (
        <AddFriend onClose={() => setOpenNewFriend(false)} />
      )}
      {openPermission && (
        <ChangePermission onClose={() => setOpenPermission(false)} />
      )}
    </>
  );
}
