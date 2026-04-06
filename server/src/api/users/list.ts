import type { Request, Response } from "express";
import { userRepo } from "../../db.js";

export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await userRepo.find({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        storageQuotaBytes: true,
        storageUsedBytes: true,
        rootFolder: true,
        // passwordHash simply not listed = excluded ✅
      },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: `failed to list users: ${err}` });
  }
}
