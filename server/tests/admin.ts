import { AdminAccount, insertValidAdmin, server } from "./utils.js";
import { test, expect } from "vitest";

async function login(): Promise<AdminAccount> {
  let newAdmin = await insertValidAdmin();
  expect(newAdmin.success).toBeTruthy;
  expect(newAdmin.cookie).toBeDefined();
  return newAdmin;
}

async function loginInvalidAdmin(): Promise<string> {
  let body = { username: "notfound", password: "notfound" };
  let resp = await server.post("/api/admin/login").send(body).expect(401);
  return resp.body.error;
}

test("login returns token", login);

test("login with not found admin", async () => {
  let error = await loginInvalidAdmin();
  expect(error).toEqual("Invalid credentials");
});
