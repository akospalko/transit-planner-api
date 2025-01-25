import { Router } from "express";
import getProfile from "../controllers/userController/getProfile";
import getAllUsers from "../controllers/userController/getAllUsers";
import {
  updateEmail,
  updatePassword,
} from "../controllers/userController/updateUser";
import { Role } from "../enums/authentication";
import authorizeRoles from "../middleware/authorizeRoles";
import authenticateToken from "../middleware/authenticateToken";
import restrictToSelf from "../middleware/restrictToSelf";

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
