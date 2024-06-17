import { createActionGroup, props } from "@ngrx/store";
import { IbFilterSyntaxExtended } from "../../../kai-filter";
import { Sort } from "@angular/material/sort";
import { IbKaiTableParams } from "./interfaces";

export const urlStateActions = createActionGroup({
  source: 'KaiTable/UrlState',
  events: {
    'Set Filters': props<{ tableName: string; params: IbFilterSyntaxExtended }>(),
    'Set Paginator': props<{ tableName: string; params: {pageIndex: number, pageSize: number} }>(),
    'Set Aggregated Columns': props<{ tableName: string; params: Record<string, string> }>(),
    'Set Sort': props<{ tableName: string; params: Sort }>(),
    'Handle View Change': props<{tableName: string; params: Omit<IbKaiTableParams, 'tableName'> & {view: string}}>()
  },
});
