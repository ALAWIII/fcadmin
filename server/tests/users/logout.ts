import { expect, test } from "vitest";
import { addUser, insertValidAdmin, server } from "../utils.js";
import { v4 } from "uuid";
import rdsCon from "../../src/redis.js";

async function logoutUsers() {
  let admin = await insertValidAdmin();

  let emUsPs = v4();
  let user = await addUser({
    username: emUsPs,
    email: emUsPs,
    password: emUsPs,
  });
  let before = await rdsCon.exists(`refresh:${user.username}`);
  expect(before).toEqual(1);
  let resp = await server
    .post("/api/user/logout")
    .set("Cookie", admin.cookie!)
    .expect(200);
  let after = await rdsCon.exists(`refresh:${user.username}`);
  expect(after).toEqual(0);

  return resp.body as number;
}

test("force logout all users success.", async () => {
  const resp = await logoutUsers();

  expect(resp).toBeGreaterThanOrEqual(1);
});
