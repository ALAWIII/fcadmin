import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { AdminRepo } from "../lib.js";
import app from "../app.js";
import settings from "../config.js";
import type { Request, Response } from "express";
import { logger } from "../telemetry.js";
import type { Admin } from "../models.js";

async function login(req: Request, res: Response): Promise<void> {
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
    res.json({ token });
  } catch (err) {
    logger.error({ err }, "Login error"); // ← will reveal the real cause
    res.status(500).json({ error: "Internal server error" });
  }
}
app.post("/api/admin/login", login);
