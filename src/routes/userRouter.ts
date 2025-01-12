import { Router } from "express";
import getUser from "../controllers/userController/getUser";
import getAllUsers from "../controllers/userController/getAllUser";
import {
  updateEmail,
  updatePassword,
} from "../controllers/userController/updateUser";

const userRouter: Router = Router();

userRouter.get("/get-all", getAllUsers);
userRouter.get("/:id/get", getUser);
userRouter.patch("/:id/update-email", updateEmail);
userRouter.patch("/:id/update-password", updatePassword);
// userRouter.route("/:id/verify").post();

export default userRouter;
