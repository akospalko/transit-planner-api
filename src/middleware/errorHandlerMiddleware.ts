import { Request, Response, NextFunction } from "express";
import sendResponse from "../utility/responseHandler";
import { ErrorResponse } from "../types/apiTypes";

export type ErrorHandlerMiddlewareParameter = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | Promise<Response<any, Record<string, any>> | undefined>;

const errorHandlerMiddleware = (handler: ErrorHandlerMiddlewareParameter) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await handler(req, res, next);
    } catch (error) {
      const errors: ErrorResponse<null> = {};

      errors.message = `Error: ${error}`;
      sendResponse(res, {
        status: 500,
        message: "Internal error",
        error: errors,
      });
      res.status(500).json({ error: `Error: ${error}` });
    }
  };
};

export default errorHandlerMiddleware;
