import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import settings from "./config.js";
import { logger } from "./telemetry.js";
// server/src/middleware.ts

/**
 used to protect and redirect user to login page when he doesnot provide the token or when he accesses a private endpoint.
*/
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token;
  logger.debug({ path: req.path, token: token }, "start requireAuth process.");

  if (!token) return res.redirect("/");

  try {
    jwt.verify(token, settings.secrets.hmac);
    logger.debug("token verified successfully.");
    next();
  } catch {
    logger.error("invalid or missing token redirect to login page.");
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

/**
 * auth middleware to extract token from headers and cookies.
 */
export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token ?? req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
  logger.debug({ token: token, path: req.path }, "start authenticating admin.");
  if (!token) {
    logger.error({ token: token }, "invalid or missing token.");
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    req.user = jwt.verify(token, settings.secrets.hmac) as JwtPayload;
    logger.debug("token verified.");
    next();
  } catch (err: any) {
    logger.error({ error: err }, "unexpected authentication error.");
    const msg =
      err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
    res.status(401).json({ error: msg });
  }
}
