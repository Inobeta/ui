import { sessionReducer } from './session/reducers';
import { ActionReducerMap } from '@ngrx/store';
import { loaderReducer } from './loader/reducers';
import { IbSessionEffects } from './session/effects';
import { IbLoaderState } from './loader/interfaces';
import { IbSessionState } from './session/interfaces';

export interface IHttpStore{
  session: IbSessionState;
  loader: IbLoaderState;
}

export const ibHttpReducers: ActionReducerMap<IHttpStore> = {
  session: sessionReducer,
  loader: loaderReducer,
};

export const ibHttpEffects = [
  IbSessionEffects
]
