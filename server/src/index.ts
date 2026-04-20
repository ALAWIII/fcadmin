import app from "./app.js";
import { auth } from "./middleware.js";
import { listUsers } from "./api/users/list.js";
import { addUser } from "./api/users/add.js";
import fs from "fs";
import { default as express } from "express";
import { validate, version } from "uuid";
import path from "path";
import { updateUser } from "./api/users/update.js";
import { removeUser } from "./api/users/remove.js";
import { logoutUser } from "./api/users/logout.js";
import { listChildren } from "./api/objects/metadata.js";
import { remove } from "./api/objects/remove.js";
import { getMe } from "./api/users/me.js";
import { fileURLToPath } from "url";

export function isUuidV4(id: string): boolean {
  return validate(id) && version(id) === 4;
}

const userRouter = express.Router();

// apply middleware to all user routes
userRouter.use(auth);

// define routes relative to /api/user
userRouter.get("/list", listUsers);
userRouter.post("/add", addUser);
userRouter.patch("/update/:id", updateUser);
userRouter.delete("/remove/:id", removeUser);
userRouter.post("/logout/", logoutUser);
userRouter.get("/me", getMe);
// mount router
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

console.log({
  __dirname,
  clientDir,
  indexFile,
  exists: fs.existsSync(indexFile),
});
// server/src/index.ts
// Serve built UI from ui/build/
app.use(
  express.static(clientDir, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        console.log("sending html");
        res.setHeader("Cache-Control", "no-cache"); // always revalidate HTML
      } else {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable"); // cache JS/CSS forever
      }
    },
  }),
);
app.use(express.static(clientDir));

// Catch-all: serve index.html for all non-API routes (React Router handles the rest)
app.get("/{*splat}", (req, res) => {
  if (req.path.startsWith("/api"))
    return res.status(404).json({ error: "Not found" });
  res.sendFile(indexFile, {
    headers: { "Cache-Control": "no-cache" },
  });
});
