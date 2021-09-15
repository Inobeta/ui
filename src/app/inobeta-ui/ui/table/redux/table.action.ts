import { createAction, props } from '@ngrx/store';
import { Sort } from '@angular/material/sort';

/** deprecated
 * View store/reducer for new actions
 */
export const resetFilters = createAction('[Ib Table Filters] Reset filters');
/** deprecated
 * View store/reducer for new actions
 */
export const addFilterToTable = createAction('[Ib Table Filters] Update filters', props<{tableName: string, filterName: string, filterValue: any}>());
/** deprecated
 * View store/reducer for new actions
 */
export const addSortToTable = createAction('[Ib Table Filters] Update sort', props<{tableName: string, sortType: Sort, emitChange: boolean}>());
/** deprecated
 * View store/reducer for new actions
 */
export const addPaginatorFiltersToTable = createAction('[Ib Table Filters] Update paginator filters', props<{tableName: string, previousPageIndex: number, pageIndex: number, pageSize: number, lengthP: number}>());

