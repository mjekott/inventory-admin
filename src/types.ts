declare type SessionPayload = {
  userId: string;
  expiresAt: Date;
};

declare type LoginState = {
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
  formError?: string;
};
