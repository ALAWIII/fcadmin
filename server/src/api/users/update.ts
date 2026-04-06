import type { Request, Response } from "express";
import { userRepo } from "../../db.js";
import { logger } from "../../telemetry.js";
import { z, type ZodSafeParseResult } from "zod";

const UserUpdateSchema = z
  .object({
    username: z.string().optional(),
    email: z.email().optional(),
    storageQuotaBytes: z.number().optional(),
    storageUsedBytes: z.number().optional(),
  })
  .strict();
type UserUpdate = z.infer<typeof UserUpdateSchema>;

export async function updateUser(req: Request, res: Response): Promise<void> {
  let id = req.params.id as string;
  logger.info({ id }, "start new update user transaction.");
  const parsed: ZodSafeParseResult<UserUpdate> = UserUpdateSchema.safeParse(
    req.body,
  );

  if (!parsed.success) {
    // Validate body — reject empty update
    logger.error({ parsed }, "provided fields may be invalid or incorrect ");
    res.status(400).json({ error: z.treeifyError(parsed.error) });
    return;
  }
  const update = Object.fromEntries(
    Object.entries(parsed.data).filter(([_, v]) => v !== undefined),
  );
  logger.info({ update }, "fields parsed success.");

  try {
    logger.info("updating user info.");
    id = id as string;
    const result = await userRepo.update({ id }, update);

    if (result.affected === 0) {
      logger.error({ update }, "no accounts/users where updated.");
      res.status(404).json({ error: "User not found" });
      return;
    }
    let upUser = await userRepo.findOne({
      where: { id: id },
    });
    res.status(200).json({ user: upUser });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
}
