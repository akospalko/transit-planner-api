export type ErrorGeneral = {
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
