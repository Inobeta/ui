import { Sort } from "@angular/material/sort";
import { IbFilterSyntaxExtended } from "../../../kai-filter";
import { IbTableFilterState } from "../../../kai-table/table.types";

export interface IView {
  id: string;
  name: string;
  groupName: string;
  data: ITableViewData;
  initial?: boolean;
}

export interface ITableViewData {
  /**
   * Legacy elaborated filter type.  Prefer {@link filters} for the
   * canonical raw filter form values.
   */
  filter: IbFilterSyntaxExtended;
  /**
   * Canonical raw filter form values — the serializable representation
   * suitable for store, URL and view snapshots.
   * Optional; if absent, consumers should fall back to {@link filter}
   * and normalize at the boundary.
   */
  filters?: IbTableFilterState | null;
  pageSize: number;
  aggregatedColumns: Record<string, string>;
  sort: Sort;
}

export class IbView implements IView {
  id: string;
  name: string;
  groupName: string;
  data: ITableViewData;

  constructor(view: Partial<IView>) {
    this.id = view?.id ?? btoa(Math.random().toString());
    this.name = view?.name;
    this.groupName = view?.groupName;
    this.data = view?.data;
  }
}
