import { createFeature } from '@ngrx/store';
import { IUrlStateState } from './url-state/interfaces';
import { urlStateReducer } from './url-state/reducers';
import { UrlStateEffects } from "./url-state/effects";
import { ibKaiTableExtraSelectors } from './url-state/selectors';



export const kaiTableEffects = [
    UrlStateEffects,
]


export const ibKaiTableFeature = createFeature({
  name: 'ibKaiTable',
  reducer: urlStateReducer,
  extraSelectors: ibKaiTableExtraSelectors
})

export const {
  selectTables,
  ibTableSelectUrlState,
  ibTableSelectLastQueryStringRaw,
  ibTableSelectLastQueryString
} = ibKaiTableFeature
