import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/authenticationTypes";
import sendResponse from "../utility/responseHandler";
import { ErrorResponse } from "../types/ApiTypes";

/**
 * Middleware to restrict access to routes containing user IDs.
 * Ensures the authenticated user can only perform actions on their own data.
 */
const restrictToSelf = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const requestedUserId: number = Number(req.params.id);
  const authenticatedUserId: number | undefined = req.user?.id;

  if (requestedUserId !== authenticatedUserId) {
    const errors: ErrorResponse<null> = {
      message: "Access denied: You can only access your own data.",
    };
    return sendResponse(res, {
      status: 403,
      message: "Authorization error",
      error: errors,
    });
  }

  next();
};

export default restrictToSelf;
