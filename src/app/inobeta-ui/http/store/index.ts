import { ibSessionReducerMain } from './session/reducers';
import { ActionReducerMap, createFeature } from '@ngrx/store';
import { IbSessionEffects } from './session/effects';
import { IbLoaderState } from './loader/interfaces';
import { ibSessionExtraSelectors } from './session/selectors';
import { IbSessionState } from './session/interfaces';
import { ibLoaderExtraSelectors, ibLoaderReducerMain } from 'public_api';

export interface IHttpStore{
  session: IbSessionState;
  loader: IbLoaderState;
}


export const ibHttpEffects = [
  IbSessionEffects
]


export const ibSessionFeature = createFeature({
  name: 'ibHttpSessionState',
  reducer: ibSessionReducerMain,
  extraSelectors: ibSessionExtraSelectors
})

export const {
  ibSelectAccessTokenExp,
  ibSelectActiveSession,
  ibSelectDecodedData
} = ibSessionFeature



export const ibLoaderFeature = createFeature({
  name: 'ibHttpLoaderState',
  reducer: ibLoaderReducerMain,
  extraSelectors: ibLoaderExtraSelectors
})

export const {
  ibSelectIsHttpLoading,
  ibSelectIsHttpUrlLoading
} = ibLoaderFeature

export const ibHttpReducers: ActionReducerMap<IHttpStore> = {
  session: ibSessionFeature.reducer,
  loader: ibLoaderFeature.reducer,
};
