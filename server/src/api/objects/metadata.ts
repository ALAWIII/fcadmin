import type { Request, Response } from "express";
import { fileRepo, folderRepo } from "../../db.js";
import { logger } from "../../telemetry.js";
import { isUuidV4 } from "../../index.js";

export async function listChildren(req: Request, res: Response) {
  const folderId = req.params.id as string;
  if (!isUuidV4(folderId)) {
    logger.error({ folderId }, "invalid folder id.");
    return res.status(400).json({ error: "Invalid folder id." });
  }
  try {
    const q = { where: { parentId: folderId }, withDeleted: true };
    const [files, folders] = await Promise.all([
      fileRepo.find(q),
      folderRepo.find(q),
    ]);

    res.json({ files, folders });
  } catch (err) {
    console.error(
      "[listChildren] Failed to fetch children for folder:",
      folderId,
      err,
    );
    res.status(500).json({ error: "Failed to fetch folder contents." });
  }
}
