import { createElement } from "react";
import { createBrowserRouter, Outlet, redirect } from "react-router";
import Social from "./pages/Social";
import SocialDetail from "./pages/SocialDetail";
import DetailSocialGroup from "./pages/DetailSocialGroup";
import SocialGroups from "./pages/SocialGroups";
import History from "./pages/History";
import HistoryDetail from "./pages/HistoryDetail";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { clearAuthSession, getCurrentUser, getToken } from "./utils/auth";
import { allHistory, detailHistory } from "./controller/historyController";
import { dashboardLoader } from "./controller/dashboardController";
import { allFriends, friendDetail } from "./controller/socialController";
import { allGroups, groupDetail } from "./controller/socialGroupController";
import type { LoaderFunctionArgs } from "react-router";

async function authCheck() {
  const token = getToken();

  if (!token) {
    throw redirect("/auth");
  }

  try {
    const user = await getCurrentUser();

    return { user };
  } catch {
    clearAuthSession();
    throw redirect("/auth");
  }
}

async function guestCheck() {
  const token = getToken();

  if (token) {
    throw redirect("/");
  }
}

async function socialProfileLoader(args: LoaderFunctionArgs) {
  const username = args.params.username;

  if (!username?.startsWith("@")) {
    throw new Response("Not Found", { status: 404 });
  }

  return friendDetail({
    ...args,
    params: {
      ...args.params,
      username: username.slice(1),
    },
  });
}

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    element: createElement(MainLayout, null, createElement(Outlet)),
    errorElement: createElement(NotFound),
    loader: authCheck,
    children: [
      {
        index: true,
        Component: Dashboard,
        loader: dashboardLoader
      },
      {
        path: "social",
        Component: Social,
        loader: allFriends
      },
      {
        path: "social/groups",
        Component: SocialGroups,
        loader: allGroups,
      },
      {
        path: "social/groups/:slug",
        Component: DetailSocialGroup,
        loader: groupDetail,
      },
      {
        path: "history",
        Component: History,
        loader: allHistory
      },
      {
        path: "history/:bulan",
        Component: HistoryDetail,
        loader: detailHistory,
      },
      {
        path: "profile",
        Component: Profile,
      },
      {
        path: ":username",
        Component: SocialDetail,
        loader: socialProfileLoader
      },
      // {
      //   path: "*",
      //   Component: NotFound,
      // },
    ],
  },
  {
    path: "/auth",
    element: createElement(AuthLayout, null, createElement(Outlet)),
    loader: guestCheck,
    children: [
      {
        index: true,
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
    ],
  },
]);

export default router;
