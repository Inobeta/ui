import { createAction, props } from '@ngrx/store';
import { IbTableTotalRowState } from '../reducers/table.reducer';

export const ibTableActionSaveConfig = createAction(
  '[IbTable] IbTableAction SaveConfig',
  props<{ name: string }>()
);

export const ibTableActionSetTotalRowCell = createAction(
  '[IbTable] IbTableAction TotalRow Set Cell',
  props<IbTableTotalRowState>()
)



