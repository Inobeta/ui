import { sessionReducer } from './session/reducers';
import { ActionReducerMap } from '@ngrx/store';
import { IbLoaderState } from './loader/interfaces';
import { loaderReducer } from './loader/reducers';
import { LoaderEffects } from "./loader/effects";
import { IbSessionState } from './session/interfaces';

export interface IHttpStore{
  session: IbSessionState;
  loader: IbLoaderState;
}

export const httpReducers: ActionReducerMap<IHttpStore> = {
  session: sessionReducer,
  loader: loaderReducer,
};

export const httpEffects = [
  LoaderEffects,
]
