import { AdminRepo, app } from "../src/lib.js";
import { default as supertest } from "supertest";
import { v4 as uuidv4 } from "uuid";
import { default as argon2 } from "argon2";

export const server = supertest(app);

export class AdminAccount {
  username: string;
  passwordHash: string;
  pswd: string;
  jwt?: string;

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
  newAdmin.jwt = resp.body.token;
  return newAdmin;
}
