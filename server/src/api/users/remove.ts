import type { Request, Response } from "express";
import { fileRepo, userRepo } from "../../db.js";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { rfs } from "../../lib.js";
import { logger } from "../../telemetry.js";

export async function removeUser(req: Request, res: Response): Promise<void> {
  let userId = req.params.id as string;
  logger.info({ userId }, "start remove user transaction.");
  try {
    // 1. Fetch all file IDs owned by this user
    logger.info("get a list of user files.");
    const files = await fileRepo.findBy({ ownerId: userId });
    // 2. Delete all objects from RustFS (bucket = user_id)
    if (files.length > 0) {
      logger.info("fire a delete request to RustFs.");
      const dCom = new DeleteObjectsCommand({
        Bucket: userId,
        Delete: {
          Objects: files.map((f) => ({ Key: f.id })),
          Quiet: true, // only report errors, not per-object success
        },
      });
      await rfs.send(dCom);
    }
    logger.info("delete user record from db.");
    // 3. Delete user — DB cascade handles files & folders records
    const result = await userRepo.delete({ id: userId });

    if (result.affected === 0) {
      logger.error("user not found.");
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    logger.info(`failed to remove user: ${err}`);
    res.status(500).json({ error: "Failed to remove user" });
  }
}
