import { ActionReducerMap, createFeature } from '@ngrx/store';
import { IUrlStateState } from './url-state/interfaces';
import { urlStateReducer } from './url-state/reducers';
import { UrlStateEffects } from "./url-state/effects";
import { ibKaiTableExtraSelectors } from './url-state/selectors';

/** @deprecated Legacy composite store type — kept for reference only. */
export interface IKaiTableStore {
  urlState: IUrlStateState;
}

/** @deprecated Legacy composite reducer map — kept for reference only. */
export const kaiTableReducers: ActionReducerMap<IKaiTableStore> = {
  urlState: urlStateReducer,
};

export const kaiTableEffects = [
  UrlStateEffects,
];

export const ibKaiTableFeature = createFeature({
  name: 'ibKaiTable',
  reducer: urlStateReducer,
  extraSelectors: ibKaiTableExtraSelectors
});

// ---------------------------------------------------------------------------
// Canonical (new) selector exports
// ---------------------------------------------------------------------------

export const {
  // Auto-generated — the full tables dictionary
  selectTables,

  // New canonical selectors (dictionary-based)
  selectIbKaiTableRecord,
  selectIbKaiTableSnapshot,
  selectTableSort,
  selectTableFilters,
  selectTablePageIndex,
  selectTablePageSize,
  selectTableSelectedView,
  selectTableAggregatedColumns,
  selectTableInitialized,

  // Legacy compatibility selectors
  ibTableSelectUrlState,
  ibTableSelectLastQueryStringRaw,
  ibTableSelectLastQueryString,
} = ibKaiTableFeature;
