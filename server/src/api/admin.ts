import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { AdminRepo } from "../lib.js";
import app from "../app.js";
import settings from "../config.js";
import type { Request, Response } from "express";

async function login(req: Request, res: Response) {
  const { username, password } = req.body;

  const user = await AdminRepo.findOne({
    where: { username },
    select: { username: true, passwordHash: true }, // passwordHash is select:false by default
  });

  if (!user || !(await argon2.verify(user.passwordHash, password))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = jwt.sign({ sub: username }, settings.secrets.hmac, {
    expiresIn: "1h",
  });

  res.json({ token });
}
app.post("/api/admin/login", login);
