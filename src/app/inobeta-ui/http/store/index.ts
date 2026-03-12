import { ibSessionReducerMain } from './session/reducers';
import { ActionReducerMap, createFeature } from '@ngrx/store';
import { IbSessionEffects } from './session/effects';
import { IbLoaderState } from './loader/interfaces';
import { ibSessionExtraSelectors } from './session/selectors';
import { IbSessionState } from './session/interfaces';
import { ibLoaderReducerMain } from './loader/reducers';
import { ibLoaderExtraSelectors } from './loader/selectors';

export interface IHttpStore {
  session: IbSessionState;
  loader: IbLoaderState;
}


export const ibHttpEffects = [
  IbSessionEffects
]

/** @deprecated this element will be removed in v21 */
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


/** @deprecated this element will be removed in v21 */
export const ibLoaderFeature = createFeature({
  name: 'ibHttpLoaderState',
  reducer: ibLoaderReducerMain,
  extraSelectors: ibLoaderExtraSelectors
})

export const {
  ibSelectIsHttpLoading,
  ibSelectIsHttpUrlLoading
} = ibLoaderFeature
/** @deprecated this element will be removed in v21 */
export const ibHttpReducers: ActionReducerMap<IHttpStore> = {
  session: ibSessionFeature.reducer,
  loader: ibLoaderFeature.reducer,
};
