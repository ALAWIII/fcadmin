// ui/app/lib/api.ts

import { useUserStore, type User } from "./models";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include", // ← sends httpOnly cookie automatically
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    window.location.href = "/"; // redirect to login if token expired
    throw new Error("Unauthorized");
  }

  if (!res.ok) throw new Error(await res.text());

  return res.json();
}

const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
export async function fetchUsers() {
  try {
    const data = await api.get<User[]>("/user/list");
    useUserStore.getState().setUsers(data);
  } catch (err) {
    console.error("fetchUsers failed:", err);
  }
}
