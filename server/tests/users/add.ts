import { expect, test } from "vitest";
import { addUser, insertValidAdmin, server, type NewUser } from "../utils.js";
import { v4 as uuidv4 } from "uuid";

async function addUserWithNoPswd() {
  let newAdmin = await insertValidAdmin();
  let emUsPs = uuidv4();
  let resp = await server
    .post("/api/user/add")
    .send({
      email: emUsPs,
      username: emUsPs,
    })
    .auth(newAdmin.jwt!, { type: "bearer" })
    .expect(400);
  return resp.body.error as string;
}
async function duplicateUser() {
  let admin = await insertValidAdmin();
  let emUsPs = uuidv4();
  let user: NewUser = { email: emUsPs, username: emUsPs, password: emUsPs };
  await server
    .post("/api/user/add")
    .send(user)
    .auth(admin.jwt!, { type: "bearer" })
    .expect(201);
  let resp = await server
    .post("/api/user/add")
    .send(user)
    .auth(admin.jwt!, { type: "bearer" })
    .expect(409);

  return resp.body.error as string;
}
test("add user success", async () => {
  let emUsPs = uuidv4();
  let user = await addUser({
    username: emUsPs,
    email: emUsPs,
    password: emUsPs,
  });
  expect(user.email).toEqual(user.username);
  expect(user.passwordHash).toBeUndefined();
});

test("missing password field", async () => {
  let error = await addUserWithNoPswd();
  expect(error).contains(
    "email, username and password are required, or password length < 4",
  );
});

test("duplicate user", async () => {
  let error = await duplicateUser();
  expect(error).contains("Username or email already taken");
});
