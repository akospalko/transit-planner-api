import { Response, NextFunction } from "express";
import sendResponse from "../utility/responseHandler";
import { AuthenticatedRequest } from "../types/authenticationTypes";
import { Role } from "../enums/authentication";
import { ErrorResponse } from "../types/ApiTypes";

export const authorizeRoles = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRoles: Role[] | undefined = req.user?.role;

    const errors: ErrorResponse<null> = {};

    if (!userRoles || !roles.some((role) => userRoles.includes(role))) {
      errors.message = "Access denied: insufficient permissions";
      return sendResponse<null, null>(res, {
        status: 403,
        message: "Authorization error",
        error: errors,
      });
    }

    next();
  };
};
