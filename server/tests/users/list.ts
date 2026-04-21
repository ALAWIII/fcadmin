import { expect, test } from "vitest";
import { addUser, insertValidAdmin, server } from "../utils.js";
import { v4 } from "uuid";
import type { User } from "../../src/models.js";

async function listUsers() {
  const admin = await insertValidAdmin();

  let uArr: User[] = [];
  for (let i = 0; i < 3; i++) {
    const uInfo = v4();
    let userF = {
      email: `${uInfo}@shawarma.com`,
      password: uInfo,
      username: uInfo,
    };
    uArr.push(await addUser(userF));
  }

  let resp = await server
    .get("/api/user/list")
    .set("Cookie", admin.cookie!)
    .expect(200);
  let usersL = resp.body as User[];
  expect(usersL).containSubset(uArr);
  expect(usersL.findIndex((u) => u.id === uArr[0]?.id)).not.toEqual(-1);
}
test("list all users.", listUsers);
