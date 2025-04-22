import { Router } from "express";
import authenticateToken from "@src/middleware/authenticateToken";
import register from "@src/controllers/authenticationController/register";
import login from "@src/controllers/authenticationController/login";
import logout from "@src/controllers/authenticationController/logout";
import refreshToken from "@src/controllers/authenticationController/refreshToken";
import forgotPassword from "@src/controllers/authenticationController/forgotPassword";
import refreshPassword from "@src/controllers/authenticationController/refreshPassword";
import verifyUserByEmail from "@src/controllers/authenticationController/verifyUserByEmail";
import requestUserVerificationEmail from "@src/controllers/authenticationController/requestUserVerificationEmail";

const authenticationRouter: Router = Router();

authenticationRouter.post("/register", register);
authenticationRouter.post("/login", login);
authenticationRouter.post("/logout", authenticateToken, logout);
authenticationRouter.post("/refresh-token", refreshToken);

authenticationRouter.post("/forgot-password", forgotPassword);
authenticationRouter.post("/refresh-password", refreshPassword);

authenticationRouter.post(
  "/request-verification-email",
  requestUserVerificationEmail
);
authenticationRouter.get("/verify-email", verifyUserByEmail);

export default authenticationRouter;
