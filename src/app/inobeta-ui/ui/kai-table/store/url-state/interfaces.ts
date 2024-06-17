import { Sort } from "@angular/material/sort";
import { IbFilterSyntaxExtended } from "../../../kai-filter";

export type IUrlStateState = {
  tables: IbKaiTableNamedParams[]
}

export type IbKaiTableParams = {
  view: string;
  pageSize: number;
  page: number;
  filters: IbFilterSyntaxExtended;
  aggregatedColumns: Record<string, string>;
  sort: Sort;
}

export type IbKaiTableNamedParams = Partial<IbKaiTableParams> & { tableName: string };
