import { createActionGroup, props } from "@ngrx/store";
import { ITableViewData, IView } from "./views/table-view";

export const TableViewActions = createActionGroup({
  source: "TableView",
  events: {
    "Add View": props<{
      view: IView;
    }>(),
    "Save View": props<{ id: string; data: ITableViewData }>(),
    "Rename View": props<{ id: string; name: string }>(),
    "Delete View": props<{ id: string }>()
  },
});
