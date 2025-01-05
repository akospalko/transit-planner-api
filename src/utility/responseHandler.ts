import { Response } from "express";

export interface ApiResponse<T, E> {
  status: number;
  message?: string;
  data?: T;
  error?: E;
}

function sendResponse<T, E>(res: Response, params: ApiResponse<T, E>): void {
  const { status, message, data, error } = params;

  const response: ApiResponse<T, E> = {
    status,
    message,
    ...(data && { data }),
    ...(error && { error }),
  };

  res.status(status).json(response);
}

export default sendResponse;
