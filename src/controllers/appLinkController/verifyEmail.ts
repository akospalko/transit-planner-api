import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "@src/prisma-client";
import errorHandlerMiddleware from "@src/middleware/errorHandlerMiddleware";
import sendResponse from "@src/utility/responseHandler";
import { QueriedUser } from "@tp-types/userTypes";

const verifyEmail = errorHandlerMiddleware(
  async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return sendResponse(res, {
        status: 400,
        message: "Invalid or missing token.",
      });
    }

    const hashedToken: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user: QueriedUser | null = await prisma.user.findFirst({
      where: {
        verifyEmailToken: hashedToken,
        verifyEmailTokenExp: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return sendResponse(res, {
        status: 400,
        message: "Token is invalid or expired.",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifiedAt: new Date(),
        verifyEmailToken: null,
        verifyEmailTokenExp: null,
      },
    });

    const successMessage: string = "Email verified successfully!";

    res.send(`
      <html>
        <head><title>Redirecting...</title></head>
        <body>
          <script>
            // Wait for a short duration to ensure the user sees the message
            setTimeout(function() {
              window.location = "${
                process.env.FRONTEND_APP_URI_SCHEME
              }://email-verified?message=${encodeURIComponent(successMessage)}";
            }, 500);
          </script>
          <p>If you are not redirected, <a href="${
            process.env.FRONTEND_APP_URI_SCHEME
          }://email-verified?message=${encodeURIComponent(
      successMessage
    )}">click here</a>.</p>
        </body>
      </html>
    `);
  }
);

export default verifyEmail;
