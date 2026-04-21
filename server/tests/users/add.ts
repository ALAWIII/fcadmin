import { expect, test } from "vitest";
import { addUser, insertValidAdmin, server, type NewUser } from "../utils.js";
import { v4 as uuidv4 } from "uuid";

async function addUserWithNoPswd() {
  let admin = await insertValidAdmin();
  let emUsPs = uuidv4();
  let resp = await server
    .post("/api/user/add")
    .send({
      email: emUsPs,
      username: emUsPs,
    })
    .set("Cookie", admin.cookie!)
    .expect(400);
  let error = resp.body.error as string;
  expect(error).contains(
    "email, username and password are required, or password length < 4",
  );
}
async function duplicateUser() {
  let admin = await insertValidAdmin();
  let emUsPs = uuidv4();
  let user: NewUser = { email: emUsPs, username: emUsPs, password: emUsPs };
  await server
    .post("/api/user/add")
    .send(user)
    .set("Cookie", admin.cookie!)
    .expect(201);
  let resp = await server
    .post("/api/user/add")
    .send(user)
    .set("Cookie", admin.cookie!)
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

test("missing password field", addUserWithNoPswd);

test("duplicate user", async () => {
  let error = await duplicateUser();
  expect(error).contains("Username or email already taken");
});
