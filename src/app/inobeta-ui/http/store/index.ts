import { ibSessionReducerMain } from './session/reducers';
import { ActionReducerMap, createFeature } from '@ngrx/store';
import { loaderReducer } from './loader/reducers';
import { IbSessionEffects } from './session/effects';
import { IbLoaderState } from './loader/interfaces';
import { ibSessionExtraSelectors } from './session/selectors';


export interface IHttpStore{
  loader: IbLoaderState;
}

export const ibHttpReducers: ActionReducerMap<IHttpStore> = {
  loader: loaderReducer,
};

export const ibHttpEffects = [
  IbSessionEffects
]


export const ibSessionFeature = createFeature({
  name: 'session',
  reducer: ibSessionReducerMain,
  extraSelectors: ibSessionExtraSelectors
})

export const {
  ibSelectAccessTokenExp,
  ibSelectActiveSession,
  ibSelectDecodedData
} = ibSessionFeature
