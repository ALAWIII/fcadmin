import { create } from "zustand";
import { z } from "zod";
export interface User {
  id: string; // user id
  username: string;
  email: string;
  createdAt: string;
  storageQuotaBytes: number; // its big int in database
  storageUsedBytes: number;
  rootFolder: string; // id to the rootFolder
}
export const userAddSchema = z
  .object({
    username: z.string().min(3),
    email: z.email(),
    password: z.string().min(4),
  })
  .strict();
// 1. Define the schema
export const userUpdateSchema = z
  .object({
    username: z.string().min(3).optional(),
    email: z.email().optional(),
    storageQuotaBytes: z.number().min(0).optional(),
    storageUsedBytes: z.number().min(0).optional(),
  }) // Enforce at least one field is present
  .refine((data) => Object.keys(data).length > 0, {
    message: "Update payload cannot be empty",
  })
  // Enforce quota logic if both fields are provided
  .refine(
    (data) => {
      if (
        data.storageQuotaBytes !== undefined &&
        data.storageUsedBytes !== undefined
      ) {
        return data.storageUsedBytes <= data.storageQuotaBytes;
      }
      return true;
    },
    { message: "Used storage cannot exceed quota limit" },
  );

// 2. Extract the TypeScript type directly from the schema
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type UserAdd = z.infer<typeof userAddSchema>;
type UserStore = {
  users: User[];
  setUsers: (users: User[]) => void;
};

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  setUsers: (users) => set({ users }),
}));
