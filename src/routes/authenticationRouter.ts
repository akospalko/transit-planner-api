import { Router } from "express";
import registerUser from "../controllers/authenticationController/registerUser";
import login from "../controllers/authenticationController/login";
import logout from "../controllers/authenticationController/logout";
import refreshToken from "../controllers/authenticationController/refreshToken";
import authenticateToken from "../middleware/authenticateToken";
// import { Role } from "../enums/authentication";
// import { authorizeRoles } from "../middleware/authorizeRoles";

const authenticationRouter: Router = Router();

authenticationRouter.post("/register", registerUser);
authenticationRouter.post("/login", login);
authenticationRouter.post("/logout", authenticateToken, logout);
authenticationRouter.post("/refresh-token", refreshToken);

// TODO
// authenticationRouter.get(
//   "/admin",
//   authenticateToken,
//   authorizeRoles([Role.ADMIN]),
//   adminController
// );

export default authenticationRouter;
