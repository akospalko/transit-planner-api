import { Response, NextFunction } from "express";
import sendResponse from "../utility/responseHandler";
import { ErrorGeneral } from "../types/ErrorTypes";
import { AuthenticatedRequest } from "../types/authenticationTypes";
import { Role } from "../enums/authentication";

export const authorizeRoles = (roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRoles: Role[] | undefined = req.user?.role;

    if (!userRoles || !roles.some((role) => userRoles.includes(role))) {
      return sendResponse<null, ErrorGeneral>(res, {
        status: 403,
        error: { general: "Access denied: insufficient permissions" },
      });
    }

    next();
  };
};
