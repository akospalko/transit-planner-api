import { Router } from "express";
import authenticateToken from "@src/middleware/authenticateToken";
import register from "@src/controllers/authenticationController/register";
import login from "@src/controllers/authenticationController/login";
import logout from "@src/controllers/authenticationController/logout";
import refreshToken from "@src/controllers/authenticationController/refreshToken";
import requestPasswordResetEmail from "@src/controllers/authenticationController/requestPasswordResetEmail";
import resetPassword from "@src/controllers/authenticationController/resetPassword";
import verifyUserByEmail from "@src/controllers/authenticationController/verifyUserByEmail";
import resetPasswordRedirectLink from "@src/controllers/authenticationController/resetPasswordRedirectLink";
import googleTokenLogin from "@src/controllers/authenticationController/googleTokenLogin";

const authenticationRouter: Router = Router();

authenticationRouter.post("/register", register);
authenticationRouter.post("/login", login);
authenticationRouter.post("/google-token-login", googleTokenLogin);
authenticationRouter.post("/logout", authenticateToken, logout);
authenticationRouter.post("/refresh-token", refreshToken);

authenticationRouter.post("/forgot-password", requestPasswordResetEmail);
authenticationRouter.get(
  "/reset-password-redirect-link",
  resetPasswordRedirectLink
);
authenticationRouter.post("/reset-password", resetPassword);
authenticationRouter.get("/verify-email", verifyUserByEmail);

export default authenticationRouter;
