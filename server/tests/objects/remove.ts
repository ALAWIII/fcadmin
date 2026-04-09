import { v4 } from "uuid";
import {
  addUser,
  injectFile,
  injectFolder,
  insertValidAdmin,
  rfsObjectExists,
  server,
} from "../utils.js";
import rfsCon from "../../src/rustfs.js";
import { expect, test } from "vitest";
import type { File, Folder } from "../../src/models.js";

async function removeFile() {
  const admin = await insertValidAdmin();
  let uinfo = v4();
  let user = await addUser({ email: uinfo, password: uinfo, username: uinfo });
  let folder1 = await injectFolder(v4(), user.id, user.rootFolder!);
  let file1 = await injectFile(v4(), user.id, folder1.id, rfsCon);
  let file2 = await injectFile(v4(), user.id, folder1.id, rfsCon);
  let before = await rfsObjectExists(rfsCon, user.id, file1.id);
  expect(before).true;
  let resp = await server
    .delete(`/api/object/remove/${folder1.id}?kind=folder&uid=${user.id}`)
    .auth(admin.jwt!, { type: "bearer" })
    .expect(200);
  expect(resp.body.message as string).toEqual("deletion success.");
  let after = await rfsObjectExists(rfsCon, user.id, file1.id);
  expect(after).false;
  let folder1Childs = await server
    .get(`/api/object/children/${folder1.id}`)
    .auth(admin.jwt!, { type: "bearer" })
    .expect(200);

  const { files, folders } = folder1Childs.body as {
    files: File[];
    folders: Folder[];
  };
  expect(
    files.filter((f) => {
      return f.status != "deleted";
    }).length > 0,
  ).false;
  expect(
    files.filter((f) => {
      return f.status == "deleted" && [file1.id, file2.id].includes(f.id);
    }).length == 2,
  ).true;
  const { files: rfiles, folders: rfolders } = (
    await server
      .get(`/api/object/children/${user.rootFolder!}`)
      .auth(admin.jwt!, { type: "bearer" })
      .expect(200)
  ).body as {
    files: File[];
    folders: Folder[];
  };
  expect(
    rfolders.findIndex((f) => f.status == "deleted" && f.id == folder1.id),
  ).toEqual(0);
}

test("remove folder.", removeFile);
