import api from "./api";
import type { User } from "./types";

type ApiResponse<T> = {
  message: string;
  data: T;
};

type LoginResult = {
  user: User;
  token: string;
};

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as User;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function setAuthSession({ token, user }: LoginResult) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function getCurrentUser() {
  const response = await api.get<ApiResponse<User>>("/users/me");
  const user = response.data.data;
  const token = getToken();

  if (token) {
    setAuthSession({ token, user });
  }

  return user;
}