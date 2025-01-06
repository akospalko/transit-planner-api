import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../../prisma/prisma";
import errorHandlerMiddleware from "../../middleware/errorHandlerMiddleware";
import sendResponse from "../../utility/responseHandler";
import { UserRegisterRequestBody } from "../../types/userTypes";
import { ErrorGeneral } from "../../types/ErrorTypes";

const registerUser = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { username, email, password }: UserRegisterRequestBody = req.body;

    const userExists: boolean =
      (await prisma.user.count({
        where: {
          OR: [{ username }, { email }],
        },
      })) > 0;

    if (userExists) {
      return sendResponse<null, ErrorGeneral>(res, {
        status: 400,
        error: { general: "User with this username or email already exists." },
      });
    }

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const user: UserRegisterRequestBody = {
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
