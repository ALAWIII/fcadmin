import app from "../app.js";
import { auth } from "../middleware.js";
import { addUser } from "./users/add.js";
import { listUsers } from "./users/list.js";
import { logoutUser } from "./users/logout.js";
import { removeUser } from "./users/remove.js";
import { updateUser } from "./users/update.js";
import { default as express } from "express";

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
