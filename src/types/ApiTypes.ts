type ErrorResponse<F> = {
  message?: string;
  fields?: F;
};

interface ApiResponse<T, F> {
  status: number;
  message: string;
  data?: T;
  error?: ErrorResponse<F>;
}

interface LoginResponseError {
  loginIdentifier: string;
  password: string;
}

interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponseError {
  username: string;
  email: string;
  password: string;
}

interface RefreshTokenResponseData {
  accessToken: string;
  refreshToken: string;
}

type UpdateEmailError = {
  email?: string;
  currentPassword?: string;
};

type UpdatePasswordError = {
  currentPassword?: string;
  newPassword?: string;
};

export {
  ErrorResponse,
  ApiResponse,
  LoginResponseError,
  LoginResponseData,
  RegisterResponseError,
  RefreshTokenResponseData,
  UpdateEmailError,
  UpdatePasswordError,
};
