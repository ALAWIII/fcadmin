import type { Request, Response } from "express";
import { fileRepo, folderRepo } from "../../db.js";
import { validate, version } from "uuid";
import { logger } from "../../telemetry.js";

function isUuidV4(id: string): boolean {
  return validate(id) && version(id) === 4;
}

export async function listChildren(req: Request, res: Response) {
  const folderId = req.params.id as string;
  if (!isUuidV4(folderId)) {
    logger.error({ folderId }, "invalid folder id.");
    return res.status(400).json({ error: "Invalid folder id." });
  }
  try {
    const [files, folders] = await Promise.all([
      fileRepo.findBy({ parentId: folderId }),
      folderRepo.findBy({ parentId: folderId }),
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
