import type { Request, Response } from "express";

export function logoutUser(req: Request, res: Response) {} // force logouts of a user or many users at once! by revoking their refresh tokens from redis
