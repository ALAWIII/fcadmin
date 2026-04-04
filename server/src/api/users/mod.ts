import app from "../../app.js";
import { auth } from "../../middleware.js";
import { addUser } from "./add.js";
import { listUsers } from "./list.js";
import { logoutUser } from "./logout.js";
import { removeUser } from "./remove.js";
import { updateUser } from "./update.js";
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
