import { createFeature } from '@ngrx/store';
import { urlStateReducer } from './url-state/reducers';
import { UrlStateEffects } from "./url-state/effects";
import { ibKaiTableExtraSelectors } from './url-state/selectors';

export const kaiTableEffects = [
  UrlStateEffects,
];

export const ibKaiTableFeature = createFeature({
  name: 'ibKaiTable',
  reducer: urlStateReducer,
  extraSelectors: ibKaiTableExtraSelectors
});

export const {
  // Auto-generated — the full tables dictionary
  selectTables,

  // Canonical selectors (dictionary-based)
  selectIbKaiTableRecord,
  selectIbKaiTableSnapshot,
  selectTableSort,
  selectTableFilters,
  selectTablePageIndex,
  selectTablePageSize,
  selectTableSelectedView,
  selectTableAggregatedColumns,
  selectTableInitialized,
} = ibKaiTableFeature;
