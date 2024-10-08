import { MatPaginatorDefaultOptions } from "@angular/material/paginator";
import { Sort } from "@angular/material/sort";

export interface IbPaginatorOptions extends MatPaginatorDefaultOptions {
  hide?: boolean;
   //TODO please add support to pageIndex it is overrided by _updatePaginator in table datasource
  pageIndex?: number;
}

export interface IbTableDef {
  paginator?: IbPaginatorOptions;
  initialSort?: Sort;
}

export interface IbTableRowEvent<T = any> {
  tableName: string;
  type: string;
  row: T;
}

export interface IbTableRowSelectionChange<T = any> {
  tableName: string;
  selection: boolean;
  row: T;
}

export type IbKaiTableState = "idle" | "loading" | "no_data" | "http_error";
