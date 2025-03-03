import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import { RegisterRequestBody } from "../../types/authenticationTypes";
import { QueriedUser } from "../../types/userTypes";
import { ErrorResponse, RegisterResponseError } from "../../types/apiTypes";

const register = errorHandlerMiddleware(async (req: Request, res: Response) => {
  const { username, email, password }: RegisterRequestBody = req.body;

  const errors: ErrorResponse<RegisterResponseError> = {};

  if (!username || !email || !password) {
    errors.message = "Missing required fields: username, email, or password";
    return sendResponse<null, RegisterResponseError>(res, {
      status: 400,
      message: "Registration failed",
      error: errors,
    });
  }

  const existingUser: QueriedUser | null = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existingUser) {
    errors.message = "User with this username or email already exists.";
    return sendResponse<null, RegisterResponseError>(res, {
      status: 400,
      message: "Registration failed",
      error: errors,
    });
  }

  const hashedPassword: string = await bcrypt.hash(password, 10);

  const user: RegisterRequestBody = {
    username,
    email,
    password: hashedPassword,
  };

  await prisma.user.create({
    data: user,
  });

  return sendResponse<null, null>(res, {
    status: 201,
    message: "User created successfully",
  });
});

export default register;
