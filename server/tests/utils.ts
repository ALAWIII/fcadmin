import { AdminRepo, fileRepo, folderRepo, rdsCon } from "../src/lib.js";
import { default as supertest } from "supertest";
import { v4 as uuidv4 } from "uuid";
import { default as argon2 } from "argon2";
import type { User } from "../src/models.js";
import {
  HeadObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { expect } from "vitest";
import { logger } from "../src/telemetry.js";
import app from "../src/index.js";

export const server = supertest(app);

export class AdminAccount {
  username: string;
  passwordHash: string;
  pswd: string;
  jwt?: string;
  cookie?: string[] | undefined;
  success = false;

  constructor(name: string, pswd: string, pswdhash: string) {
    this.passwordHash = pswdhash;
    this.pswd = pswd;
    this.username = name;
  }
}

async function insertAdmin(): Promise<AdminAccount> {
  let username = uuidv4();
  let pswdhash = await argon2.hash(username);
  let adac = new AdminAccount(username, username, pswdhash);
  let ad = AdminRepo.create({
    username: username,
    passwordHash: pswdhash,
  });
  await AdminRepo.insert(ad);
  return adac;
}

export async function insertValidAdmin() {
  let newAdmin = await insertAdmin();
  let body = { username: newAdmin.username, password: newAdmin.pswd };
  let resp = await server.post("/api/admin/login").send(body).expect(200);

  const raw = resp.headers["set-cookie"];
  logger.info({ rawCok: raw }, "extracting token cookie");

  let cookieArr = Array.isArray(raw) ? raw : raw ? [raw] : undefined; // ← grab cookie instead of token
  newAdmin.cookie = cookieArr?.map((c) => c.split(";")[0]);
  newAdmin.success = resp.body.success ?? false;
  return newAdmin;
}
export interface NewUser {
  email: string;
  username: string;
  password: string;
}
export async function addUser(user: NewUser) {
  let newAdmin = await insertValidAdmin();
  let resp = await server
    .post("/api/user/add")
    .send(user)
    .set("Cookie", newAdmin.cookie!)
    .expect(201);
  rdsCon.setex(`refresh:${user.username}`, 60 * 60, "");
  return resp.body as User;
}

async function uploadRfsFile(con: S3Client, bucket: string, key: string) {
  let cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: "j" });
  return await con.send(cmd);
}
export async function injectFile(
  id: string,
  ownerId: string,
  parentId: string,
  rfsCon: S3Client,
) {
  let f = await fileRepo.save({
    id,
    ownerId,
    parentId,
    name: `shawarma_${id}`,
    size: 2,
    etag: "notImportant",
    mimeType: "notImportant",
  });
  let resp = await uploadRfsFile(rfsCon, ownerId, id);
  expect(resp.Size).toBeDefined;
  return f;
}
export async function injectFolder(
  id: string,
  ownerId: string,
  parentId: string,
) {
  let f = await folderRepo.save({
    id,
    ownerId,
    parentId,
    name: id,
  });

  return f;
}
export async function rfsObjectExists(
  rfsCon: S3Client,
  bucket: string,
  key: string,
): Promise<boolean> {
  try {
    await rfsCon.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (e: any) {
    if (e.name === "NotFound" || e.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw e; // re-throw unexpected errors
  }
}
