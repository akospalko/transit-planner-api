import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import { prisma } from "../../../prisma/prisma";
import { QueriedUser } from "../../types/userTypes";
import sendResponse from "../../utility/responseHandler";
import { ErrorGeneral } from "../../types/ErrorTypes";

export type LoginRequestBody = {
  // TODO Outsource
  // username: string;
  email: string;
  password: string;
};

const login = errorHandlerMiddleware(async (req: Request, res: Response) => {
  const { email, /* username, */ password }: LoginRequestBody = req.body; // TODO username

  const user: QueriedUser | null = await prisma.user.findUnique({
    where: { email },
  });

  if (!user)
    return sendResponse<null, ErrorGeneral>(res, {
      status: 404,
      error: { general: "User not found" },
    });

  const isPasswordValid: boolean = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid)
    return sendResponse<null, ErrorGeneral>(res, {
      status: 401,
      error: { general: "Invalid credentials" },
    });

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

  res.json({ accessToken, refreshToken });
});

export default login;
