import type { Request, Response } from "express";
import { dbCon } from "../../db.js";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { rfs } from "../../lib.js";
import { isUuidV4 } from "../../index.js";

const DELETE_FILE = /*sql */ `
  WITH
  updated_files AS (
      UPDATE files
      SET status = 'deleted', last_modified = NOW()
      FROM (
          SELECT id, status AS old_status
          FROM files
          WHERE id = $1
      ) AS prev
      WHERE files.id = prev.id
      RETURNING files.id, files.parent_id, files.size, prev.old_status
  ),
  total_size AS (
      -- Only sum sizes for files that were NOT already deleted
      -- (their storage was already deducted on first deletion)
      SELECT COALESCE(SUM(size), 0) AS ts
      FROM updated_files
      WHERE old_status != 'deleted'
  ),
  decrement_size AS (
      UPDATE users
      SET storage_used_bytes = GREATEST(storage_used_bytes - (SELECT ts FROM total_size), 0)
      WHERE id = $2
        AND (SELECT ts FROM total_size) > 0
  )
  SELECT id  FROM updated_files;
`;
const DELETE_FOLDER = /*sql */ `
  WITH RECURSIVE folder_tree AS (
      SELECT id FROM folders
      WHERE id = $1
        AND owner_id = $2

      UNION ALL

      SELECT f.id FROM folders f
      INNER JOIN folder_tree ft ON f.parent_id = ft.id
      WHERE f.owner_id = $2
  ),
  locked_folders AS (
      SELECT id, copying_children_count FROM folders
      WHERE id IN (SELECT id FROM folder_tree)
      FOR UPDATE
  ),
  guard AS (
      SELECT EXISTS (
          SELECT 1 FROM locked_folders WHERE copying_children_count > 0
      ) AS blocked
  ),
  updated_files AS (
      UPDATE files
      SET status = 'deleted', last_modified = NOW()
      FROM (
          SELECT id, status AS old_status
          FROM files
          WHERE parent_id IN (SELECT id FROM folder_tree)
            AND owner_id = $2
      ) AS prev
      WHERE files.id = prev.id
        AND (SELECT NOT blocked FROM guard)
      RETURNING files.id, files.parent_id, files.size, prev.old_status
  ),
  total_size AS (
      SELECT COALESCE(SUM(size), 0) AS ts
      FROM updated_files
      WHERE old_status != 'deleted'
  ),
  decrement_size AS (
      UPDATE users
      SET storage_used_bytes = GREATEST(storage_used_bytes - (SELECT ts FROM total_size), 0)
      WHERE id = $2
        AND (SELECT ts FROM total_size) > 0
  ),
  updated_folders AS (
      UPDATE folders
      SET
          status = 'deleted',
          deleted_at = NOW()
      WHERE id IN (SELECT id FROM locked_folders)
        AND (SELECT NOT blocked FROM guard)
  )
  SELECT id FROM (
      SELECT id
      FROM updated_files

      UNION ALL

      SELECT NULL::uuid as id
      WHERE (SELECT blocked FROM guard)

  ) AS result;

  /*
  | blocked | id     | meaning                              |
  | ------- | ------ | ------------------------------------ |
  | true    | NULL   | blocked → None     409 error         |
  | false   | NULL   | empty folder, no jobs → Some(vec![]) |
  | false   | <uuid> | has files → Some(vec![ids])          |
  */
  `;
export async function remove(req: Request, res: Response) {
  let fid = req.params.id as string;
  const kind = req.query.kind as string | undefined | null;
  const uid = req.query.uid as string | undefined | null;
  if (
    !uid ||
    !isUuidV4(uid) ||
    !isUuidV4(fid) ||
    !kind ||
    !["file", "folder"].includes(kind.toLowerCase())
  ) {
    res
      .status(400)
      .json({ error: "invalid file/folder id,kind or invalid user id." });
    return;
  }
  let query = kind == "file" ? DELETE_FILE : DELETE_FOLDER;
  try {
    const fIds = await dbCon.query<{ id: string | null }[]>(query, [fid, uid]);
    if (kind == "folder" && fIds.some((row) => row.id === null)) {
      res.status(409).json({ error: "folder is busy, try again later." });
      return;
    }
    if (fIds.length > 0) {
      const cmd = new DeleteObjectsCommand({
        Bucket: uid!,
        Delete: {
          Objects: fIds.map((k) => ({ Key: k.id! })),
          Quiet: true,
        },
      });

      await rfs.send(cmd);
    }
    res.json({ message: "deletion success." });
  } catch (err) {
    res.status(500).json({ error: "failed to delete files/folder." });
  }
}
