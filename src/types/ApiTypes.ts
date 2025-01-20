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

export type ErrorResponse<F> = {
  message?: string;
  fields?: F;
};

export interface ApiResponse<T, F> {
  status: number;
  message: string;
  data?: T;
  error?: ErrorResponse<F>;
}

export interface LoginResponseError {
  loginIdentifier: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponseError {
  username: string;
  email: string;
  password: string;
}

export interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}
