export class IbSession<T extends IbAPITokens | IbAPITokens> {
  user: IbUserLogin;
  /**
   * @deprecated: user serverData instead
   */
  userData: any;
  valid: boolean;

  /**
   * @deprecated: use serverData instead
   */
  authToken: string;
  serverData: T
}

export class IbUserLogin {
  /**
   * @deprecated use email instead of username
   */
  username?: string;
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
  sessionToken?: string;

}
