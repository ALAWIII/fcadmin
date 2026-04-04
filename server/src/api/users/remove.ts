import type { Request, Response } from "express";
import { fileRepo, userRepo } from "../../db.js";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { rfs } from "../../lib.js";

export async function removeUser(req: Request, res: Response): Promise<void> {
  let user_id = req.params.id as string;

  try {
    // 1. Fetch all file IDs owned by this user
    const files = await fileRepo.findBy({ ownerId: user_id });

    // 2. Delete all objects from RustFS (bucket = user_id)
    if (files.length > 0) {
      const dCom = new DeleteObjectsCommand({
        Bucket: user_id,
        Delete: {
          Objects: files.map((f) => ({ Key: f.id })),
          Quiet: true, // only report errors, not per-object success
        },
      });
      await rfs.send(dCom);
    }

    // 3. Delete user — DB cascade handles files & folders records
    const result = await userRepo.delete({ id: user_id });

    if (result.affected === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove user" });
  }
}
