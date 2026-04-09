import app from "../app.js";
import { auth } from "../middleware.js";
import { remove } from "./objects/remove.js";
import { listChildren } from "./objects/metadata.js";
import { addUser } from "./users/add.js";
import { listUsers } from "./users/list.js";
import { logoutUser } from "./users/logout.js";
import { removeUser } from "./users/remove.js";
import { updateUser } from "./users/update.js";
import { default as express } from "express";
import { validate, version } from "uuid";

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
// mount router
app.use("/api/user", userRouter);

const objectRouter = express.Router();
objectRouter.use(auth);

objectRouter.get("/children/:id", listChildren);
objectRouter.delete("/remove/:id", remove);
app.use("/api/object", objectRouter);
