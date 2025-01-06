import { Router } from "express";
import registerUser from "../controllers/userController/registerUser";
import getUser from "../controllers/userController/getUser";
import getAllUsers from "../controllers/userController/getAllUser";
import {
  updateEmail,
  updatePassword,
} from "../controllers/userController/updateUser";

const userRouter: Router = Router();

userRouter.route("/get-all").get(getAllUsers);
userRouter.route("/:id/get").get(getUser);
userRouter.route("/register").post(registerUser);
userRouter.route("/:id/update-email").patch(updateEmail);
userRouter.route("/:id/update-password").patch(updatePassword);
// userRouter.route("/:id/verify").post();

export default userRouter;
