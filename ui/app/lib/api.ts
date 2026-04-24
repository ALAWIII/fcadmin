// ui/app/lib/api.ts

import {
  userAddSchema,
  userUpdateSchema,
  useUserStore,
  type User,
  type UserUpdate,
} from "./models";

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
export async function updateUser(user: UserUpdate, uid: string) {
  const result = userUpdateSchema.safeParse(user);

  if (!result.success) {
    console.error("Validation failed:", result.error);
    throw new Error(result.error.message);
  }
  await api.patch(`/user/update/${uid}`, result.data);
}

export async function addUser(e: React.SubmitEvent<HTMLFormElement>) {
  e.preventDefault();

  // 1. Extract raw data from the form
  const formData = new FormData(e.currentTarget);
  const rawData = Object.fromEntries(formData.entries());

  // 2. Validate with Zod
  const result = userAddSchema.safeParse(rawData);

  if (!result.success) {
    console.error("Validation failed:", result.error);
    // TODO: Show validation errors to the user (e.g., a toast notification)
    return;
  }
  try {
    await api.post("/user/add", result.data);
  } catch (err) {
    console.error(`failed to add new user ${err}`);
  }
}
export async function removeUser(uid: string) {
  try {
    await api.delete(`/user/remove/${uid}`);
  } catch (err) {
    console.error(`failed to delete user ${err}`);
  }
}

export async function logoutUsers() {
  try {
    let resp = await api.post("/user/logout", {});
    console.log(resp);
  } catch (err) {
    console.error(`Failed to logout users: ${err}`);
  }
}
