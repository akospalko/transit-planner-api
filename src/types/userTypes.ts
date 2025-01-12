import { Role } from "@prisma/client";

export type UserUpdateEmailRequestBody = {
  email: string;
  currentPassword: string;
};

export type UserUpdatePasswordRequestBody = {
  newPassword: string;
  currentPassword: string;
};

// Data
export type QueriedUser = {
  id: number;
  username: string;
  email: string;
  password: string;
  roles: Role[];
  refreshToken: string | null;
  createdAt: Date;
  verifiedAt: Date | null;
};

export type QueriedUserInsensitive = Pick<
  QueriedUser,
  "id" | "username" | "email" | "createdAt" | "verifiedAt"
>;

export type QueriedUserPassword = Pick<QueriedUser, "id" | "password">;
