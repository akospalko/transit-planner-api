import { Role } from "@prisma/client";

export type UserUpdateEmailRequestBody = {
  email: string;
  currentPassword: string;
};

export type UserUpdatePasswordRequestBody = {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

// Data
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
  createdAt: Date;
  verifiedAt: Date | null;
};

export type QueriedUserPassword = Pick<QueriedUser, "password">;

export type QueriedUserInsensitive = Pick<
  QueriedUser,
  "id" | "username" | "email" | "createdAt" | "verifiedAt"
>;
