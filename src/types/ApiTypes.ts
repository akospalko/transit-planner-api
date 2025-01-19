export type ErrorGeneral = {
  // TODO Replace with ErrorMessage -> remove
  general: string;
};

export type ErrorUpdateEmail = {
  general?: string;
  email?: string;
  currentPassword?: string;
};

export type ErrorUpdatePassword = {
  general?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type ErrorWithMessageAndFields<F = Record<string, string>> = {
  message?: string;
  fields?: F;
};

export interface ApiResponse<T, F = Record<string, string>> {
  status: number;
  message: string;
  data?: T;
  error?: ErrorWithMessageAndFields<F>;
}
