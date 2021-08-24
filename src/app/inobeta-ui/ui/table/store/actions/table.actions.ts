import { createAction, props } from '@ngrx/store';
import { IbTableConfigState, IbTableFilterState, IbTableSortState, IbTableTotalRowState } from '../reducers/table.reducer';

export const ibTableActionSaveConfig = createAction(
  '[IbTable] IbTableAction SaveConfig',
  props<{ options: any, tableName: string }>()
);

export const ibTableActionLoadConfig = createAction(
  '[IbTable] IbTableAction LoadConfig',
  props<{ configName: string, tableName: string }>()
);


export const ibTableActionSetConfig = createAction(
  '[IbTable] IbTableAction SetConfig',
  props<{ config: {config: IbTableConfigState, name: string}, tableName: string }>()
);

export const ibTableActionSetTotalRowCell = createAction(
  '[IbTable] IbTableAction TotalRow Set Cell',
  props<{state: IbTableTotalRowState, tableName: string}>()
);

export const ibTableActionSelectSortingField = createAction(
  '[IbTable] IbTableAction Select Sorting Field',
  props<{options: IbTableSortState, tableName: string}>()
);

export const ibTableActionAddFilterField = createAction(
  '[IbTable] IbTableAction Add Filter Field',
  props<{state: IbTableFilterState, tableName: string}>()
);



