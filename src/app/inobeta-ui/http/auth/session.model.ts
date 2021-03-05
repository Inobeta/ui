export class IbSession {
  user: IbUserLogin;
  userData: any;
  valid: boolean;
  authToken: string;
}

export class IbUserLogin {
  username: string;
  password: string;
  rememberMe: boolean;
}

export enum IbAuthTypes {
  BASIC_AUTH,
  JWT
}
