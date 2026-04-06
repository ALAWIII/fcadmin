import { expect, test } from "vitest";
import { addUser, insertValidAdmin, server } from "../utils.js";
import { v4 } from "uuid";
import type { User } from "../../src/models.js";

async function updateUser() {
  const admin = await insertValidAdmin();
  let uInfo = v4();
  let user = await addUser({ username: uInfo, password: uInfo, email: uInfo });
  let newUInof = v4();
  let resp = await server
    .patch(`/api/user/update/${user.id}`)
    .auth(admin.jwt!, { type: "bearer" })
    .send({
      email: `${newUInof}@potato.com`,
      username: newUInof,
      storageQuotaBytes: 589,
    })
    .expect(200);
  let upUser = resp.body.user as User;
  expect(upUser.email).toEqual(`${newUInof}@potato.com`);
  expect(upUser.username).toEqual(newUInof);
  expect(upUser.storageQuotaBytes).toEqual("589");
  expect(upUser.storageUsedBytes).toEqual("0");
}

async function updateUserNullId() {
  const admin = await insertValidAdmin();
  let newUInof = v4();
  let resp = await server
    .patch(`/api/user/update/`) // no path like that only update/:id !!
    .auth(admin.jwt!, { type: "bearer" })
    .send({ email: newUInof, username: newUInof, storageQuotaBytes: 589 })
    .expect(404);
}

async function updateUserWrongId() {
  const admin = await insertValidAdmin();
  let newUInof = v4();
  let resp = await server
    .patch(`/api/user/update/${newUInof}`)
    .auth(admin.jwt!, { type: "bearer" })
    .send({
      email: `${newUInof}@potato.com`,
      username: newUInof,
      storageQuotaBytes: 589,
    })
    .expect(404);
}

async function updateUserEmptyFields() {
  const admin = await insertValidAdmin();
  let uInfo = v4();
  let user = await addUser({ username: uInfo, password: uInfo, email: uInfo });
  let resp = await server
    .patch(`/api/user/update/${user.id}`)
    .auth(admin.jwt!, { type: "bearer" })
    .expect(400);
}

async function updateUserIncorrectFileds() {
  const admin = await insertValidAdmin();
  let uInfo = v4();
  let user = await addUser({ username: uInfo, password: uInfo, email: uInfo });
  let newUInof = v4();
  let resp = await server
    .patch(`/api/user/update/${user.id}`)
    .auth(admin.jwt!, { type: "bearer" })
    .send({ gomail: newUInof })
    .expect(400);
}
test("update user email,username and storageQuotaBytes", updateUser);

test("update user with id is null", updateUserNullId);
test("update user with wrong id, Not Found.", updateUserWrongId);
test("update user with no fields", updateUserEmptyFields);
test("update user with wrong fields", updateUserIncorrectFileds);
