import { Role } from "@prisma/client";

// User
export type QueriedUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  roles: Role[];
  refreshToken: string | null;
  resetToken?: string | null;
  resetTokenExp?: Date | null;
  verifyEmailToken?: string | null;
  verifyEmailTokenExp?: Date | null;
  emailChangeCode?: string | null;
  pendingEmail?: string | null;
  emailChangeExp?: Date | null;
  createdAt: Date;
  verifiedAt: Date | null;
};

// Email change
export type RequestEmailChangeRequestBody = {
  email: string;
  password: string;
};

export type ConfirmEmailChangeRequestBody = {
  code: string;
};

export type QueriedUserRequestEmailChange = Pick<
  QueriedUser,
  "password" | "email"
>;
export type QueriedUserConfirmEmailChange = Pick<
  QueriedUser,
  "emailChangeCode" | "pendingEmail" | "emailChangeExp"
>;

// Update password
// TODO Rename to QueriedUserUpdatePassword
export type QueriedUserPassword = Pick<QueriedUser, "password">;

export type QueriedUserInsensitive = Pick<
  QueriedUser,
  "id" | "username" | "email" | "createdAt" | "verifiedAt"
>;

export type UserUpdatePasswordRequestBody = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};
