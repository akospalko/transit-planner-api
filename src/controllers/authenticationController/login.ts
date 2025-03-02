import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import { prisma } from "../../prisma/prisma";
import sendResponse from "../../utility/responseHandler";
import { QueriedUser } from "../../types/userTypes";
import { LoginRequestBody } from "../../types/authenticationTypes";
import {
  ErrorResponse,
  LoginResponseError,
  LoginResponseData,
} from "../../types/apiTypes";

const login = errorHandlerMiddleware(async (req: Request, res: Response) => {
  const { loginIdentifier, password }: LoginRequestBody = req.body;

  const errors: ErrorResponse<LoginResponseError> = {};

  if (!loginIdentifier || !password) {
    errors.message = "Username or email, and password are required.";
    return sendResponse<null, LoginResponseError>(res, {
      status: 400,
      message: "Login failed",
      error: errors,
    });
  }

  const user: QueriedUser | null = await prisma.user.findFirst({
    where: {
      OR: [{ username: loginIdentifier }, { email: loginIdentifier }],
    },
  });

  if (!user) {
    errors.message = "Invalid credentials";
    return sendResponse<null, LoginResponseError>(res, {
      status: 401,
      message: "Login failed",
      error: errors,
    });
  }

  const isPasswordValid: boolean = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    errors.message = "Invalid credentials";
    return sendResponse<null, LoginResponseError>(res, {
      status: 401,
      message: "Login failed",
      error: errors,
    });
  }

  const accessTokenSecret: string | undefined = process.env.ACCESS_TOKEN_SECRET;
  const refreshTokenSecret: string | undefined =
    process.env.REFRESH_TOKEN_SECRET;

  if (!accessTokenSecret || !refreshTokenSecret) {
    throw new Error("Token secrets are not set in environment variables.");
  }

  const accessToken: string = jwt.sign(
    { id: user.id, roles: user.roles },
    accessTokenSecret,
    { expiresIn: "15m" }
  );

  const refreshToken: string = jwt.sign({ id: user.id }, refreshTokenSecret, {
    expiresIn: "7d",
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return sendResponse<LoginResponseData, null>(res, {
    status: 200,
    message: "Login successful",
    data: { accessToken, refreshToken },
  });
});

export default login;
