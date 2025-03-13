import { Response, NextFunction } from "express";
import sendResponse from "@src/utility/responseHandler";
import { AuthenticatedRequest } from "@tp-types/authenticationTypes";
import { ErrorResponse } from "@tp-types/commonApiTypes";

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
