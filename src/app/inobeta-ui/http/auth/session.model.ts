/** @deprecated Migration scripts toward Angular core APIs are planned no earlier than v22. */
export class IbSession<T extends IbAPITokens | IbAPITokens> {
  user: IbUserLogin;
  valid: boolean;
  serverData: T
}
/** @deprecated Migration scripts toward Angular core APIs are planned no earlier than v22. */
export class IbUserLogin {
  email: string;
  password: string;
  rememberMe: boolean;
}
/** @deprecated Migration scripts toward Angular core APIs are planned no earlier than v22. */
export enum IbAuthTypes {
  BASIC_AUTH,
  JWT
}
/** @deprecated Migration scripts toward Angular core APIs are planned no earlier than v22. */
export interface IbAPITokens {
  accessToken: string;
  refreshToken: string;
}
