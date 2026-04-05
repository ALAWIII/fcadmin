import type { Request, Response } from "express";
import { default as argon2 } from "argon2";
import { dbCon, userRepo } from "../../db.js";
import { v4 as uuidv4 } from "uuid";
import { CreateBucketCommand } from "@aws-sdk/client-s3";
import { Folder, User } from "../../models.js";
import { rfs } from "../../lib.js";
import { logger } from "../../telemetry.js";

interface UserAdd {
  email: string;
  username: string;
  password: string;
}

export async function addUser(req: Request, res: Response) {
  const { email, username, password } = req.body as UserAdd;

  if (!email || !username || !password || password.length < 4) {
    res.status(400).json({
      error:
        "email, username and password are required, or password length < 4",
    });
    return;
  }
  logger.info({ email, username }, "creating new user account");
  const userId = uuidv4();
  const folderId = uuidv4();
  try {
    logger.info("hashing password");
    const passwordHash = await argon2.hash(password);
    // Atomic DB transaction
    logger.info("starting atomic database transaction.");
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
    logger.info("retrieving user info.");
    const user = await userRepo.findOne({
      where: { id: userId },
    });
    res.status(201).json(user);
  } catch (err: any) {
    if (err.code === "23505") {
      logger.error("duplicate user.");
      res.status(409).json({ error: "Username or email already taken" });
      return;
    }
    logger.error({ err }, "Failed to create user");
    res.status(500).json({ error: "Failed to create user" });
  }
  //------------------ bucket creation----
  try {
    await rfs.send(new CreateBucketCommand({ Bucket: userId }));
  } catch (err) {
    await userRepo.delete({ id: userId });
    // S3 failed — rollback DB manually
    res.status(500).json({ error: "Failed to create storage bucket" });
    return;
  }
}
