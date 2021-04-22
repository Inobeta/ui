import { createAction, props } from '@ngrx/store';
import {IbSession} from '../session.model';

export const login = createAction('[IbSession Service] Login', props<{ activeSession: IbSession}>());
export const logout = createAction('[IbSession Service] Logout');
export const changeNameSurname = createAction('[IbSession Service] Change Name And Surname', props<{ name: string, surname: string}>());

