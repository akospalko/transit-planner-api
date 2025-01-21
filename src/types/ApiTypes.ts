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

export type UpdateEmailError = {
  email?: string;
  currentPassword?: string;
};

export type UpdatePasswordError = {
  currentPassword?: string;
  newPassword?: string;
};
