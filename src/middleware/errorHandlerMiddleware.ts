import { Request, Response, NextFunction } from "express";
import sendResponse from "@src/utility/responseHandler";
import { ErrorResponse } from "@tp-types/commonApiTypes";

const errorHandlerMiddleware = <T extends Request = Request>(
  handler: (
    req: T,
    res: Response,
    next: NextFunction
  ) => Promise<void | Response<any>>
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await handler(req as T, res, next);
    } catch (error) {
      const errors: ErrorResponse<null> = {};
      errors.message = `Error: ${error}`;
      sendResponse(res, {
        status: 500,
        message: "Internal error",
        error: errors,
      });
    }
  };
};

export default errorHandlerMiddleware;
