import { SortDirection } from "@angular/material/sort";
import { Observable } from "rxjs";

export type IbTableData<T> = {
  data: T[];
  totalCount: number;
};

export interface IbTableDataProvider<T> {
  fetchData(
    sort: string,
    order: SortDirection,
    page: number,
    filter: Record<string, any>
  ): Observable<IbTableData<T>>;
}
