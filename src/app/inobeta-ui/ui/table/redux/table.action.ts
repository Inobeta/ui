import { createAction, props } from '@ngrx/store';
import { Sort } from '@angular/material/sort';

/**
* @deprecated Use IbKaiTableModule
*/
export const resetFilters = createAction('[Ib Table Filters] Reset filters');

/**
* @deprecated Use IbKaiTableModule
*/
export const addFilterToTable = createAction('[Ib Table Filters] Update filters', props<{tableName: string, filterName: string, filterValue: any}>());

/**
* @deprecated Use IbKaiTableModule
*/
export const addSortToTable = createAction('[Ib Table Filters] Update sort', props<{tableName: string, sortType: Sort, emitChange: boolean}>());

/**
* @deprecated Use IbKaiTableModule
*/
export const addPaginatorFiltersToTable = createAction('[Ib Table Filters] Update paginator filters', props<{tableName: string, previousPageIndex: number, pageIndex: number, pageSize: number, lengthP: number}>());

