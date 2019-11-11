import { createAction, props } from '@ngrx/store';
import {Session} from '../session.model';

export const login = createAction('[Session Service] Login', props<{ activeSession: Session}>());
export const logout = createAction('[Session Service] Logout');
