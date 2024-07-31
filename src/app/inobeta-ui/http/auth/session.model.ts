export class IbSession<T extends IbAPITokens | IbAPITokens> {
  user: IbUserLogin;
  valid: boolean;
  serverData: T
}

export class IbUserLogin {
  email: string;
  password: string;
  rememberMe: boolean;
}

export enum IbAuthTypes {
  BASIC_AUTH,
  JWT
}

export interface IbAPITokens {
  accessToken: string;
  refreshToken: string;
}
