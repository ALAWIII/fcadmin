import type { Request, Response } from "express";
import { userRepo } from "../../db.js";

interface UserUpdate {
  username?: string;
  email?: string;
  storageQuotaBytes?: number;
  storageUsedBytes?: number;
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id as string;
  const update = req.body as UserUpdate;

  try {
    const result = await userRepo.update({ id }, update);

    if (result.affected === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ message: "User updated" });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
}
