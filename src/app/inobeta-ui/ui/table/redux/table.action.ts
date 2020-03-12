import { createAction, props } from '@ngrx/store';
import {Sort} from '@angular/material';

export const resetFilters = createAction('[Table Filters] Reset filters');
export const addFilterToTable = createAction('[Table Filters] Update filters', props<{tableName: string, filterName: string, filterValue: any}>());
export const addSortToTable = createAction('[Table Filters] Update sort', props<{tableName: string, sortType: Sort, emitChange: boolean}>());
export const addPaginatorFiltersToTable = createAction('[Table Filters] Update paginator filters', props<{tableName: string, previousPageIndex: number, pageIndex: number, pageSize: number, lengthP: number}>());

