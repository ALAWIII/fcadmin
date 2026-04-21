import { expect, test } from "vitest";
import {
  addUser,
  rfsObjectExists,
  injectFile,
  insertValidAdmin,
  server,
} from "../utils.js";
import { v4 } from "uuid";
import rfsCon from "../../src/rustfs.js";
import { fileRepo, userRepo } from "../../src/db.js";

async function removeUser() {
  const admin = await insertValidAdmin();
  let uInfo = v4();
  let u = await addUser({
    email: `${uInfo}@shawarma.com`,
    password: uInfo,
    username: uInfo,
  });
  let fid = v4();
  let fResp = await injectFile(fid, u.id, u.rootFolder!, rfsCon);
  let fBefore = await fileRepo.findOneBy({ id: fid });
  expect(fBefore).not.toBeNull();
  let resp = await server
    .delete(`/api/user/remove/${u.id}`)
    .set("Cookie", admin.cookie!)
    .expect(200);
  let body = resp.body;
  expect(body.message as string).toEqual("User deleted");
  let fAfter = await fileRepo.findOneBy({ id: fid });
  let uAfter = await userRepo.findOneBy({ id: u.id });
  let fexists = await rfsObjectExists(rfsCon, u.id, fid);
  expect(fexists).toEqual(false);
  expect(fAfter).toBeNull();
  expect(uAfter).toBeNull();
}

async function removeNonExistedUser() {
  const admin = await insertValidAdmin();
  let uid = v4();
  let resp = await server
    .delete(`/api/user/remove/${uid}`)
    .set("Cookie", admin.cookie!)
    .expect(404);
  let body = resp.body;
  expect(body.error as string).toEqual("User not found");
}

test("remove user with all its files/folders.", removeUser);
test("remove nonexisted user.", removeNonExistedUser);
