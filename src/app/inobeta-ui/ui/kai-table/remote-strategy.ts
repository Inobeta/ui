import { Observable } from 'rxjs';

export type IbSortState = { active: string; direction: 'asc' | 'desc' | '' };

export type IbPageState = { pageIndex: number; pageSize: number };

export type IbFetchDataResponse<T> = {
  /** Subset of rows returned by the server. */
  items: T[];
  /** Total row count of the query without pagination. */
  totalCount: number;
};

export interface IbRemoteFetchStrategy<T, V = Record<string, any>> {
  fetchData(
    sort: IbSortState,
    page: IbPageState,
    filter?: V
  ): Observable<IbFetchDataResponse<T>>;
}
