import type { Request, Response } from "express";
import { default as argon2 } from "argon2";
import { dbCon } from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { CreateBucketCommand } from "@aws-sdk/client-s3";
import { Folder, User } from "../../models.js";
import { rfs } from "../../lib.js";

interface UserAdd {
  email: string;
  username: string;
  password: string;
}

export async function addUser(req: Request, res: Response) {
  const { email, username, password } = req.body as UserAdd;
  const passwordHash = await argon2.hash(password);
  const userId = uuidv4();
  const folderId = uuidv4();
  try {
    // Atomic DB transaction
    await dbCon.transaction(async (manager) => {
      // 1. Create user (no root_folder yet)
      await manager.insert(User, {
        id: userId,
        email,
        username,
        passwordHash,
      });

      // 2. Create root folder
      await manager.insert(Folder, {
        id: folderId,
        name: "",
        ownerId: userId,
      });

      // 3. Link root folder back to user
      await manager.update(User, { id: userId }, { rootFolder: folderId });
    });
  } catch (err) {
    res.status(500).json({ error: `Failed to create user: ${err}` });
    return;
  }

  try {
    await rfs.send(new CreateBucketCommand({ Bucket: userId }));
  } catch (err) {
    // S3 failed — rollback DB manually
    await dbCon.transaction(async (manager) => {
      await manager.delete(Folder, { id: folderId });
      await manager.delete(User, { id: userId });
    });
    res.status(500).json({ error: "Failed to create storage bucket" });
    return;
  }

  res.status(201).json({ message: "User created" });
}
