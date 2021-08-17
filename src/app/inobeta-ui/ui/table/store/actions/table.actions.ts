import { createAction, props } from '@ngrx/store';
import { IbTableConfigState, IbTableTotalRowState } from '../reducers/table.reducer';

export const ibTableActionSaveConfig = createAction(
  '[IbTable] IbTableAction SaveConfig',
  props<{ configName: string, tableName: string }>()
);

export const ibTableActionLoadConfig = createAction(
  '[IbTable] IbTableAction LoadConfig',
  props<{ configName: string, tableName: string }>()
);


export const ibTableActionSetConfig = createAction(
  '[IbTable] IbTableAction SetConfig',
  props<{ config: IbTableConfigState, tableName: string }>()
);

export const ibTableActionSetTotalRowCell = createAction(
  '[IbTable] IbTableAction TotalRow Set Cell',
  props<{state: IbTableTotalRowState, tableName: string}>()
)



