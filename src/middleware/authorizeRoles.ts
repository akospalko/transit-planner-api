import { Response, NextFunction } from "express";
import sendResponse from "@src/utility/responseHandler";
import { AuthenticatedRequest } from "@src/types/authenticationTypes";
import { ErrorResponse } from "@src/types/apiTypes";
import { Role } from "@src/enums/authentication";

const authorizeRoles = (allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRoles: Role[] = req.user?.roles || [];

    const errors: ErrorResponse<null> = {};

    if (!userRoles.some((role) => allowedRoles.includes(role))) {
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

export default authorizeRoles;
