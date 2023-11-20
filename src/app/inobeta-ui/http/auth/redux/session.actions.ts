import { createAction, props } from '@ngrx/store';
import {IbAPITokens, IbSession} from '../session.model';

/**
 * @deprecated use ibAuthActions.login
 */
export const login = createAction('[IbSession Service] Login', props<{ activeSession: IbSession<IbAPITokens>}>());
/**
 * @deprecated  use ibAuthActions.logout
 */
export const logout = createAction('[IbSession Service] Logout');

export const ibAuthActions = {
  login: createAction('[IbSession Service] Login', props<{ activeSession: IbSession<IbAPITokens>}>()),
  logout: createAction('[IbSession Service] Logout')
}

/**
 * @deprecated Don't use this shit
 */
export const changeNameSurname = createAction('[IbSession Service] Change Name And Surname', props<{ name: string, surname: string}>());

