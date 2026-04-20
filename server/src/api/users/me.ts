import type { Request, Response } from "express";

// Returns current logged-in user info, used by UI to verify session
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    res.json({ username: req.user?.sub });
  } catch (err) {
    res.status(500).json({ error: `failed to get user: ${err}` });
  }
}
