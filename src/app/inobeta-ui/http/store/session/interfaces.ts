import { IbAPITokens, IbSession } from "../../auth/session.model";

export interface IbSessionState{
    activeSession?: IbSession<IbAPITokens>
}
