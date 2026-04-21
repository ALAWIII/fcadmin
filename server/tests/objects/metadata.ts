import { expect, test } from "vitest";
import {
  addUser,
  injectFile,
  injectFolder,
  insertValidAdmin,
  server,
} from "../utils.js";
import { v4 } from "uuid";
import rfsCon from "../../src/rustfs.js";
import { File, Folder } from "../../src/models.js";

async function listobjects() {
  const admin = await insertValidAdmin();
  let uid = v4();
  let fileid = v4();
  let folderid = v4();
  let u = await addUser({ email: uid, password: uid, username: uid });
  let file = await injectFile(fileid, u.id, u.rootFolder!, rfsCon);
  let folder = await injectFolder(folderid, u.id, u.rootFolder!);

  let resp = await server
    .get(`/api/object/children/${u.rootFolder!}`)
    .set("Cookie", admin.cookie!)
    .expect(200);

  const { files, folders } = resp.body as { files: File[]; folders: Folder[] };

  expect(
    files.filter(
      (f) =>
        f.id === file.id &&
        f.parentId === file.parentId &&
        f.parentId === u.rootFolder!,
    ),
  ).toHaveLength(1);

  expect(
    folders.filter(
      (f) =>
        f.id === folder.id &&
        f.parentId === folder.parentId &&
        f.parentId === u.rootFolder!,
    ),
  ).toHaveLength(1);
}

async function listObjectsInvalidFid() {
  const admin = await insertValidAdmin();
  let uid = v4();
  let u = await addUser({ email: uid, password: uid, username: uid });
  let folderid = "invalid uuid";
  let resp = await server
    .get(`/api/object/children/${folderid}`)
    .set("Cookie", admin.cookie!)
    .expect(400);
  expect(resp.body.error).toEqual("Invalid folder id.");
}
test("list all files & folders", listobjects);
test("send invalid folder id.", listObjectsInvalidFid);
