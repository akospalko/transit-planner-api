import crypto from "crypto";
import { prisma } from "@src/prisma-client";
import { sendMail } from "@src/utility/sendMail";
import { QueriedUser } from "@src/types/userTypes";
import { VerificationStatus } from "@src/enums/verificationStatus";
import { MailOptions } from "@src/types/mail";

const sendUserVerificationEmail = async (
  email: string
): Promise<VerificationStatus> => {
  if (!email) return VerificationStatus.EMAIL_MISSING;

  const user: QueriedUser | null = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) return VerificationStatus.USER_NOT_FOUND;
  if (user.verifiedAt) return VerificationStatus.ALREADY_VERIFIED;

  const plainToken: string = crypto.randomBytes(32).toString("hex");
  const hashedToken: string = crypto
    .createHash("sha256")
    .update(plainToken)
    .digest("hex");
  const exp: Date = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

  await prisma.user.update({
    where: { email },
    data: {
      verifyEmailToken: hashedToken,
      verifyEmailTokenExp: exp,
    },
  });

  const verifyLink: string = `${process.env.API_URL}/auth/verify-email?token=${plainToken}`;

  const verifyUserEmail: MailOptions = {
    to: email,
    subject: "Verify Your Email",
    text: `Click to verify:\n${verifyLink}`,
    html: `<p>Click to verify:</p>
           <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background-color:#007BFF;color:#FFF;text-decoration:none;border-radius:5px;">Verify Email</a>
           <p>Raw link: ${verifyLink}</p><p>Link valid for 15 mins.</p>`,
  };

  await sendMail(verifyUserEmail);

  return VerificationStatus.EMAIL_SENT;
};

export default sendUserVerificationEmail;
