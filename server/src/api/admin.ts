import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { AdminRepo } from "../lib.js";

import settings from "../config.js";
import type { Request, Response } from "express";
import { logger } from "../telemetry.js";
import type { Admin } from "../models.js";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    logger.info({ adminName: username }, "start admin login.");

    const user: Admin | null = await AdminRepo.findOne({
      where: { username },
      select: { username: true, passwordHash: true },
    });

    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ sub: username }, settings.secrets.hmac, {
      expiresIn: "1h",
    });

    logger.info({ adminName: username }, "login success.");
    res.cookie("token", token, {
      httpOnly: true, // JS cannot read it (XSS protection)
      secure: process.env.NODE_ENV === "fc_production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour in ms
    });
    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Login error"); // ← will reveal the real cause
    res.status(500).json({ error: "Internal server error" });
  }
}
