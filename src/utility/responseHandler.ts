import { Response } from "express";

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  error?: string;
}

function sendResponse<T>(res: Response, params: ApiResponse<T>): void {
  const { status, message, data, error } = params;

  const response: ApiResponse<T> = {
    status,
    message,
    ...(data && { data }),
    ...(error && { error }),
  };

  res.status(status).json(response);
}

export default sendResponse;
