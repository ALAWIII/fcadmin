import { insertValidAdmin, server } from "./utils.js";
import { test, expect } from "vitest";

async function login(): Promise<string> {
  let newAdmin = await insertValidAdmin();
  return newAdmin.jwt!;
}

async function loginInvalidAdmin(): Promise<string> {
  let body = { username: "notfound", password: "notfound" };
  let resp = await server.post("/api/admin/login").send(body).expect(401);
  return resp.body.error;
}

test("login returns token", async () => {
  const token = await login();
  expect(token.length).not.toEqual(0);
  expect(token).toBeDefined();
});

test("login with not found admin", async () => {
  let error = await loginInvalidAdmin();
  expect(error).toEqual("Invalid credentials");
});
