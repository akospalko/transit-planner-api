import { Request, Response } from "express";
import { prisma } from "@src/prisma-client";
import sendResponse from "@src/utility/responseHandler";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import {
  ConfirmEmailChangeRequestBody,
  QueriedUserConfirmEmailChange,
} from "@tp-types/userTypes";
import { ErrorResponse } from "@tp-types/commonApiTypes";
import { AuthenticatedRequest } from "@tp-types/authenticationTypes";

const confirmEmailChange = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { code }: ConfirmEmailChangeRequestBody = req.body;
    const userId = (req as AuthenticatedRequest).user?.id;

    const errors: ErrorResponse<null> = {};

    if (!userId) {
      errors.message = "Wrong user ID format.";
      return sendResponse(res, {
        status: 401,
        message: "Confirm email change error.",
        error: errors,
      });
    }

    if (!code) {
      errors.message = "Email change confirmation code is missing.";
      return sendResponse(res, {
        status: 400,
        message: "Confirm email change error.",
      });
    }

    const user: QueriedUserConfirmEmailChange | null =
      await prisma.user.findUnique({
        where: { id: userId },
        select: {
          emailChangeCode: true,
          pendingEmail: true,
          emailChangeExp: true,
        },
      });

    if (
      !user ||
      !user.emailChangeCode ||
      !user.pendingEmail ||
      !user.emailChangeExp
    ) {
      errors.message = "No pending email change request found.";
      return sendResponse(res, {
        status: 400,
        message: "Confirm email change error.",
        error: errors,
      });
    }

    if (user.emailChangeCode !== code) {
      errors.message = "Invalid confirmation code.";
      return sendResponse(res, {
        status: 403,
        message: "Confirm email change error.",
        error: errors,
      });
    }

    if (new Date() > user.emailChangeExp) {
      errors.message = "Code has expired. Please request a new one.";
      return sendResponse(res, {
        status: 410,
        message: "Confirm email change error.",
        error: errors,
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: user.pendingEmail,
        pendingEmail: null,
        emailChangeCode: null,
        emailChangeExp: null,
      },
    });

    errors.message = "Confirm email change error.";
    return sendResponse(res, {
      status: 200,
      message: "Email successfully updated.",
    });
  }
);

export default confirmEmailChange;
