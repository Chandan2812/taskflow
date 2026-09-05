import type { User } from "./auth.types";

const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

export function saveAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredAuth(): {
  token: string;
  user: User;
} | null {
  const token = localStorage.getItem(TOKEN_KEY);
  const user = localStorage.getItem(USER_KEY);

  if (!token || !user) {
    return null;
  }

  return {
    token,
    user: JSON.parse(user),
  };
}

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
