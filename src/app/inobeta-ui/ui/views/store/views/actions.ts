import { createActionGroup, props } from "@ngrx/store";
import { TableView } from "./table-view";

export const TableViewActions = createActionGroup({
  source: "TableView",
  events: {
    "Add View": props<{
      view: TableView;
    }>(),
    "Save View": props<{ id: string; filter: Record<string, any> }>(),
    "Rename View": props<{ id: string; name: string }>(),
    "Remove View": props<{ id: string }>(),
    "Duplicate View": props<{ id: string; name: string }>(),
    "Change View": props<{ id: string, tableName: string; }>(),
  },
});
