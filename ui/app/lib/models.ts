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
    storageQuotaBytes: z.coerce.number().min(0).optional(),
    storageUsedBytes: z.coerce.number().min(0).optional(),
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

const fileItemSchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  parentId: z.uuid(),
  name: z.string(),
  size: z.coerce.number(),
  etag: z.string(),
  mimeType: z.string(),
  status: z.string(),
  visibility: z.string(),
  type: z.literal("file"),
});

const folderItemSchema = z.object({
  id: z.uuid(),
  ownerId: z.uuid(),
  parentId: z.uuid().optional(),
  name: z.string(),
  status: z.string(),
  visibility: z.string(),
  copyingChildrenCount: z.number(),
  type: z.literal("folder"),
});
const fsItemSchema = z.discriminatedUnion("type", [
  fileItemSchema,
  folderItemSchema,
]);
// 2. Discriminated union schema
export const folderChildrenResponseSchema = z.object({
  files: z.array(fileItemSchema),
  folders: z.array(folderItemSchema),
});

export type FileItem = z.infer<typeof fileItemSchema>; // a single file
export type FolderItem = z.infer<typeof folderItemSchema>; // a single folder
export type FSItem = z.infer<typeof fsItemSchema>;
