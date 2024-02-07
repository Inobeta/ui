import { Injectable } from '@angular/core';
import { SortDirection } from '@angular/material/sort';
import { Observable } from 'rxjs';

export type IbTableData<T> = {
  data: T[],
  totalCount: number
}

@Injectable()
export abstract class IbTableDataProvider<T> {
  abstract fetchData(
    sort: string,
    order: SortDirection,
    page: number,
    filter: Record<string, any>
  ): Observable<IbTableData<T>>;
}