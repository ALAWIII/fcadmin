import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import settings from "./config.js";
// server/src/middleware.ts

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;

  if (!token) return res.redirect("/");

  try {
    jwt.verify(token, settings.secrets.hmac);
    next();
  } catch {
    res.clearCookie("token");
    return res.redirect("/");
  }
}
interface JwtPayload {
  sub: string; // username (standard "subject" claim)
  iat: number; // issued at (auto-added by jsonwebtoken)
  exp: number; // expiry  (auto-added by jsonwebtoken)
}
// Extend Express Request to carry user: so that we can access jwt token content on any endpoint handler.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token ?? req.headers.authorization?.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    req.user = jwt.verify(token, settings.secrets.hmac) as JwtPayload;
    next();
  } catch (err: any) {
    const msg =
      err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    res.status(401).json({ error: msg });
  }
}
