import { Router } from "express";
import verifyEmail from "@src/controllers/appLinkController/verifyEmail";

const appLinkRouter: Router = Router();

appLinkRouter.get("/verify-email", verifyEmail);

export default appLinkRouter;
