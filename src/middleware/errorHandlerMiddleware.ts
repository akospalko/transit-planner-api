import { Request, Response, NextFunction } from "express";

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
      console.error(error);
      res.status(500).json({ error: `Error: ${error}` });
    }
  };
};

export default errorHandlerMiddleware;
