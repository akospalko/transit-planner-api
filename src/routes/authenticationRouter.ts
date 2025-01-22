import { Router } from "express";
import register from "../controllers/authenticationController/register";
import login from "../controllers/authenticationController/login";
import logout from "../controllers/authenticationController/logout";
import refreshToken from "../controllers/authenticationController/refreshToken";
import authenticateToken from "../middleware/authenticateToken";

const authenticationRouter: Router = Router();

authenticationRouter.post("/register", register);
authenticationRouter.post("/login", login);
authenticationRouter.post("/logout", authenticateToken, logout);
authenticationRouter.post("/refresh-token", refreshToken);

export default authenticationRouter;
