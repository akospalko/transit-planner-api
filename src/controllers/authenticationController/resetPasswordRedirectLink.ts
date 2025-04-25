import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import { htmlRedirect } from "@src/utility/htmlRedirect";
import { QueriedUser } from "@tp-types/userTypes";
import { RedirectParams } from "@tp-types/commonApiTypes";

const resetPasswordRedirectLink = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { token } = req.query;

    const redirectParams: RedirectParams = {
      message: "",
    };

    if (!token || typeof token !== "string") {
      redirectParams.message = "Reset password failed";
      redirectParams.error = "Invalid or missing token.";
      redirectParams.status = 400;
      const redirectLink: string = `${
        process.env.FRONTEND_APP_URI_SCHEME
      }://reset-password?message=${encodeURIComponent(
        redirectParams.message
      )}&error=${encodeURIComponent(
        redirectParams.error
      )}&status=${encodeURIComponent(redirectParams.status)}`;

      return res.send(htmlRedirect(redirectLink));
    }

    const hashedToken: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user: QueriedUser | null = await prisma.user.findFirst({
      where: { resetToken: hashedToken, resetTokenExp: { gt: new Date() } },
    });

    if (!user) {
      redirectParams.message = "Reset password failed";
      redirectParams.error = "Invalid or expired reset token";
      redirectParams.status = 400;
      const redirectLink: string = `${
        process.env.FRONTEND_APP_URI_SCHEME
      }://reset-password?message=${encodeURIComponent(
        redirectParams.message
      )}&error=${encodeURIComponent(
        redirectParams.error
      )}&status=${encodeURIComponent(redirectParams.status)}`;

      return res.send(htmlRedirect(redirectLink));
    }

    redirectParams.message = "Email verified successfully!";
    redirectParams.status = 200;
    const successRedirectLink: string = `${
      process.env.FRONTEND_APP_URI_SCHEME
    }://reset-password?token=${encodeURIComponent(
      token
    )}&message=${encodeURIComponent(redirectParams.message)}&status=${
      redirectParams.status
    }`;

    return res.send(htmlRedirect(successRedirectLink));
  }
);

export default resetPasswordRedirectLink;
