import { useRouteLoaderData } from "react-router";
import { getStoredUser, getToken } from "../utils/auth";
import type { User } from "../utils/types";

type AuthLoaderData = {
  user: User;
};

export default function useAuth() {
  const loaderData = useRouteLoaderData("root") as AuthLoaderData | undefined;
  const user = loaderData?.user ?? getStoredUser();

  return {
    user,
    token: getToken(),
    isAuthenticated: Boolean(user && getToken()),
  };
}
