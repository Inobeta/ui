/** @deprecated this element will be removed in v21 */
export class IbSession<T extends IbAPITokens | IbAPITokens> {
  user: IbUserLogin;
  valid: boolean;
  serverData: T
}
/** @deprecated this element will be removed in v21 */
export class IbUserLogin {
  email: string;
  password: string;
  rememberMe: boolean;
}
/** @deprecated this element will be removed in v21 */
export enum IbAuthTypes {
  BASIC_AUTH,
  JWT
}
/** @deprecated this element will be removed in v21 */
export interface IbAPITokens {
  accessToken: string;
  refreshToken: string;
}
