import type { LoaderFunctionArgs } from "react-router";
import api from "../utils/api";
import type { ApiResponse, Friend, Socials } from "../utils/types";

export type SocialGroup = {
  id: number;
  groupName: string;
  slug: string;
  members: number;
  description: string;
  isDefault?: boolean;
  permissions?: Record<string, boolean>;
};

export type SocialGroupDetail = {
  group: SocialGroup;
  summary: Socials["summary"];
  friends: Friend[];
};

type GroupApiItem = {
  id: number;
  groupName: string;
  slug: string;
  description: string;
  memberCount: number;
  isDefault: boolean;
  permissions: Record<string, boolean>;
};

type GroupMember = {
  id: number;
  name: string;
  emailAddress: string;
};

type SocialOverviewResponse = {
  items: Friend[];
};

export async function allGroups() {
  const { data: response } = await api.get<ApiResponse<GroupApiItem[]>>("/groups");

  return {
    data: response.data.map((group) => ({
      id: group.id,
      groupName: group.groupName,
      slug: group.slug,
      members: group.memberCount,
      description: group.description,
      isDefault: group.isDefault,
      permissions: group.permissions,
    })),
  };
}

export async function groupDetail({ params }: LoaderFunctionArgs) {

  const { data: groupsResponse } = await api.get<ApiResponse<GroupApiItem[]>>("/groups");
  console.log(groupsResponse);
  const group = groupsResponse.data.find((item) => item.slug === `/${params.slug}`);

  if (!group) {
    throw new Response("Not Found", { status: 404 });
  }

  const [{ data: membersResponse }, { data: friendsResponse }] = await Promise.all([
    api.get<ApiResponse<GroupMember[]>>(`/groups/${group.id}/members`),
    api.get<ApiResponse<SocialOverviewResponse>>("/social/friends"),
  ]);

  const friendById = new Map(friendsResponse.data.items.map((item) => [item.id, item]));
  const friends = membersResponse.data
    .map((member) => friendById.get(member.id))
    .filter((item): item is Friend => Boolean(item));

  return {
    data: {
      group: {
        id: group.id,
        groupName: group.groupName,
        slug: group.slug,
        members: group.memberCount,
        description: group.description,
        isDefault: group.isDefault,
        permissions: group.permissions,
      },
      summary: [
        { label: "Total Friends", value: friends.length },
        { label: "Relaxed", value: friends.filter((friend) => friend.status === "Relaxed").length },
        { label: "Normal", value: friends.filter((friend) => friend.status === "Normal").length },
        { label: "Exhausted", value: friends.filter((friend) => friend.status === "Exhausted").length },
      ],
      friends,
    },
  };
}
