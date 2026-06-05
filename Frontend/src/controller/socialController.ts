import type { LoaderFunctionArgs } from "react-router";
import api from "../utils/api";
import type { ApiResponse, Friend, SocialProfile, Socials } from "../utils/types";

type SocialOverviewResponse = {
  summary: Socials["summary"];
  friends: Socials["friends"];
  items: Friend[];
};

export async function allFriends() {
  const { data: response } = await api.get<ApiResponse<SocialOverviewResponse>>("/social/friends");

  return {
    data: {
      summary: response.data.summary,
      friends: response.data.friends,
    },
  };
}

export async function friendDetail({ params }: LoaderFunctionArgs) {

  const { username } = params;
  const { data: friendsResponse } = await api.get<ApiResponse<SocialOverviewResponse>>("/social/friends");
  const friend = friendsResponse.data.items.find((item) => item.username === username);

  // console.log(friend);
  if (!friend) {
    throw new Response("Not Found", { status: 404 });
  }

  // console.log(friend);
  const { data: detailResponse } = await api.get<
    ApiResponse<{ friend: Friend & { biodata?: string }; histories: SocialProfile["histories"] }>
  >(`/social/friends/${friend.id}`);

  return {
    data: {
      friend: {
        ...detailResponse.data.friend,
        bio: detailResponse.data.friend.biodata,
        stressLevel: detailResponse.data.friend.stressLevel ?? 0,
      },
      histories: detailResponse.data.histories,
    },
  };
}
