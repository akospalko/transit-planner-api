import { Response } from "express";
import { ApiResponse } from "../types/ApiTypes";

const sendResponse = <T, F>(res: Response, params: ApiResponse<T, F>): void => {
  const { status, message, data, error } = params;

  const response: ApiResponse<T, F> = {
    status,
    message,
    ...(data && { data: structuredClone(data) }),
    ...(error && { error: structuredClone(error) }),
  };

  res.status(status).json(response);
};

export default sendResponse;
