import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@src/prisma-client";
import sendResponse from "@src/utility/responseHandler";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import {
  RequestEmailChangeRequestBody,
  QueriedUserRequestEmailChange,
} from "@tp-types/userTypes";
import {
  ErrorResponse,
  RequestEmailChangeError,
} from "@tp-types/commonApiTypes";
import { AuthenticatedRequest } from "@tp-types/authenticationTypes";
import { sendMail } from "@src/utility/sendMail";

const requestEmailChange = errorHandlerMiddleware(
  async (req: AuthenticatedRequest, res: Response) => {
    const { password, email }: RequestEmailChangeRequestBody = req.body;
    const userId: number | undefined = req.user?.id;
    const errors: ErrorResponse<RequestEmailChangeError> = {};

    if (!userId) {
      errors.message = "Wrong user ID format.";
      return sendResponse(res, {
        status: 401,
        message: "Request email change error.",
        error: errors,
      });
    }

    errors.fields = {};

    if (!password) errors.fields.password = "Password is missing.";
    if (!email) errors.fields.email = "Email is missing.";

    if (Object.keys(errors.fields).length > 0) {
      return sendResponse<null, RequestEmailChangeError>(res, {
        status: 400,
        message: "Request email change error.",
        error: errors,
      });
    }

    const user: QueriedUserRequestEmailChange | null =
      await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true, email: true },
      });

    if (!user) {
      errors.message = "User not found.";
      return sendResponse(res, {
        status: 404,
        message: "Request email change error.",
        error: errors,
      });
    }

    const isPasswordValid: boolean = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      errors.fields.password = "Current password is incorrect.";
      return sendResponse<null, RequestEmailChangeError>(res, {
        status: 403,
        message: "Request email change error.",
        error: errors,
      });
    }

    const isEmailUnchanged: boolean = user.email === email;
    if (isEmailUnchanged) {
      errors.fields.email = "Email is already in use.";
      return sendResponse<null, RequestEmailChangeError>(res, {
        status: 400,
        message: "Request email change error.",
        error: errors,
      });
    }

    const emailTaken: number = await prisma.user.count({
      where: {
        email,
        NOT: { id: userId },
      },
    });

    if (emailTaken > 0) {
      errors.fields.email = "This email is already in use by another account.";
      return sendResponse<null, RequestEmailChangeError>(res, {
        status: 400,
        message: "Request email change error.",
        error: errors,
      });
    }

    const code: string = crypto.randomInt(100000, 999999).toString(); // 6-digit code

    const expiresInMinutes: number = 10;
    const expiresAt: Date = new Date(Date.now() + expiresInMinutes * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: email,
        emailChangeCode: code,
        emailChangeExp: expiresAt,
      },
    });

    await sendMail({
      to: email,
      subject: "Confirm your email change",
      text: `Your confirmation code is: ${code}`,
    });

    return sendResponse(res, {
      status: 200,
      message: `Verification code sent to ${email}`,
      data: {
        emailConfirmationRequired: true,
        expiresInMinutes: expiresInMinutes,
      },
    });
  }
);

export default requestEmailChange;
