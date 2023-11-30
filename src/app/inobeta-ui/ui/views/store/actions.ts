import { createActionGroup, props } from "@ngrx/store";
import { IView } from "./views/table-view";

export const TableViewActions = createActionGroup({
  source: "TableView",
  events: {
    "Add View": props<{
      view: IView;
    }>(),
    "Save View": props<{ id: string; data: any }>(),
    "Rename View": props<{ id: string; name: string }>(),
    "Delete View": props<{ id: string }>(),
    "Pin View": props<{ groupName: string; id: string }>(),
    "Unpin View": props<{ groupName: string; id: string }>(),
  },
});
