import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import { RegisterUserRequestBody } from "../../types/authenticationTypes";
import { ErrorGeneral } from "../../types/ErrorTypes";
import { QueriedUser } from "../../types/userTypes";

const registerUser = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { username, email, password }: RegisterUserRequestBody = req.body;

    if (!username || !email || !password) {
      return sendResponse<null, ErrorGeneral>(res, {
        status: 400,
        error: {
          general: "Missing required fields: username, email, or password",
        },
      });
    }

    const existingUser: QueriedUser | null = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return sendResponse<null, ErrorGeneral>(res, {
        status: 400,
        error: { general: "User with this username or email already exists." },
      });
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const user: RegisterUserRequestBody = {
      username,
      email,
      password: hashedPassword,
    };

    await prisma.user.create({
      data: user,
    });

    return sendResponse(res, {
      status: 201,
      message: "User created successfully",
    });
  }
);

export default registerUser;
