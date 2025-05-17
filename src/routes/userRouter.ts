import { Router } from "express";
import authorizeRoles from "@src/middleware/authorizeRoles";
import authenticateToken from "@src/middleware/authenticateToken";
import restrictToSelf from "@src/middleware/restrictToSelf";
import getProfile from "@src/controllers/userController/getProfile";
import getAllUsers from "@src/controllers/userController/getAllUsers";
import updatePassword from "@src/controllers/userController/updatePassword";
import updateEmail from "@src/controllers/userController/updateEmail";
import verifyUser from "@src/controllers/userController/verifyUser";
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
  "/update-email",
  authenticateToken,
  authorizeRoles([Role.USER, Role.ADMIN]),
  updateEmail
);

userRouter.patch(
  "/update-password",
  authenticateToken,
  authorizeRoles([Role.USER, Role.ADMIN]),
  updatePassword
);

userRouter.post(
  "/:id/verify",
  authenticateToken,
  authorizeRoles([Role.USER, Role.ADMIN]),
  restrictToSelf,
  verifyUser
);

export default userRouter;
