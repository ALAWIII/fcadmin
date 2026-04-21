import { auth, requireAuth } from "./middleware.js";
import { listUsers } from "./api/users/list.js";
import { addUser } from "./api/users/add.js";
import cookieParser from "cookie-parser";
import { validate, version } from "uuid";
import path from "path";
import { updateUser } from "./api/users/update.js";
import { removeUser } from "./api/users/remove.js";
import { logoutUser } from "./api/users/logout.js";
import { listChildren } from "./api/objects/metadata.js";
import { remove } from "./api/objects/remove.js";
import { getMe } from "./api/users/me.js";
import { fileURLToPath } from "url";
import express, { type Application } from "express";
import { login } from "./api/admin.js";
import { logger } from "./telemetry.js";
import { pinoHttp } from "pino-http";

const app: Application = express();
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp({ logger }));
export default app;

export function isUuidV4(id: string): boolean {
  return validate(id) && version(id) === 4;
}
app.post("/api/admin/login", login);
const userRouter = express.Router();
userRouter.use(auth);
userRouter.get("/list", listUsers);
userRouter.post("/add", addUser);
userRouter.patch("/update/:id", updateUser);
userRouter.delete("/remove/:id", removeUser);
userRouter.post("/logout/", logoutUser);
userRouter.get("/me", getMe);
app.use("/api/user", userRouter);

const objectRouter = express.Router();
objectRouter.use(auth);
objectRouter.get("/children/:id", listChildren);
objectRouter.delete("/remove/:id", remove);
app.use("/api/object", objectRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientDir = path.resolve(__dirname, "../../../../ui/build/client");
const indexFile = path.join(clientDir, "index.html");
logger.debug({ indexFile, clientDir }, "path to ui files.");
app.use(
  express.static(clientDir, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

/**
to protect against non-defined endpoints access.
*/
function serveProtected(path: string) {
  app.get(path, requireAuth, (req, res) => {
    res.sendFile(indexFile, { headers: { "Cache-Control": "no-cache" } });
  });
}

serveProtected("/dashboard");
serveProtected("/dashboard/{*splat}");

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});
