import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@tp-types/authenticationTypes";
import { Role } from "@src/enums/authentication";
import sendResponse from "@src/utility/responseHandler";

const authorizeRoles = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { user } = req as AuthenticatedRequest;
    const userRoles: Role[] = user?.roles || [];

    if (!userRoles.some((role) => allowedRoles.includes(role))) {
      return sendResponse(res, {
        status: 403,
        message: "Authorization error",
        error: { message: "Access denied: insufficient permissions" },
      });
    }

    next();
  };
};

export default authorizeRoles;
