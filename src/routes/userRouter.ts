import { Router } from "express";
import authorizeRoles from "@src/middleware/authorizeRoles";
import authenticateToken from "@src/middleware/authenticateToken";
import restrictToSelf from "@src/middleware/restrictToSelf";
import getProfile from "@src/controllers/userController/getProfile";
import getAllUsers from "@src/controllers/userController/getAllUsers";
import {
  updateEmail,
  updatePassword,
} from "@src/controllers/userController/updateUser";
import { Role } from "@src/enums/authentication";

const userRouter: Router = Router();

userRouter.get(
  "/get-all",
  authenticateToken,
  authorizeRoles([Role.ADMIN]),
  getAllUsers
);

// userRouter.get(
//   "/:id/get",
//   authenticateToken,
//   authorizeRoles([Role.USER, Role.ADMIN]),
//   restrictToSelf,
//   getUser
// );

userRouter.get(
  "/profile",
  authenticateToken,
  authorizeRoles([Role.USER, Role.ADMIN]),
  getProfile
);

userRouter.patch(
  "/:id/update-email",
  authenticateToken,
  authorizeRoles([Role.USER, Role.ADMIN]),
  restrictToSelf,
  updateEmail
);

userRouter.patch(
  "/:id/update-password",
  authenticateToken,
  authorizeRoles([Role.USER, Role.ADMIN]),
  restrictToSelf,
  updatePassword
);

// userRouter.route("/:id/verify").post();

export default userRouter;
