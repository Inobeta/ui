export class Session {
  user: UserLogin;
  userData: any;
  valid: boolean;
  authToken: string;
}

export class UserLogin {
  username: string;
  password: string;
  rememberMe: boolean;
}

export enum AuthTypes {
  BASIC_AUTH, JWT
}
