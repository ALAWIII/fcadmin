import type { Request, Response } from "express";
import rdsCon from "../../redis.js";
// force logouts of a user or many users at once! by revoking their refresh tokens from redis
export async function logoutUser(req: Request, res: Response) {
  try {
    const keys = await rdsCon.keys("refresh:*");
    if (keys.length > 0) await rdsCon.del(...keys);
    res.status(204);
  } catch (err) {
    res.status(500).json({ error: `failed to force logout users: ${err}` });
  }
}
