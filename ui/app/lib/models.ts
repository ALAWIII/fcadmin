import { create } from "zustand";

export interface User {
  id: string; // user id
  username: string;
  email: string;
  createdAt: string;
  storageQuotaBytes: number; // its big int in database
  storageUsedBytes: number;
  rootFolder: string; // id to the rootFolder
}
export interface UserAdd {
  email: string;
  username: string;
  password: string;
}
export interface UserUpdate {
  username?: string;
  email?: string;
  storageQuotaBytes?: number;
  storageUsedBytes?: number;
}

type UserStore = {
  users: User[];
  setUsers: (users: User[]) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));
