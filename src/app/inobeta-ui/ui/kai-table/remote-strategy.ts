import { Observable } from 'rxjs';
import type { IbFetchDataResponse } from './remote-data-source';

export type IbSortState = { active: string; direction: 'asc' | 'desc' | '' };

export type IbPageState = { pageIndex: number; pageSize: number };

export { IbFetchDataResponse } from './remote-data-source';

export interface IbRemoteFetchStrategy<T, V = Record<string, any>> {
  fetchData(
    sort: IbSortState,
    page: IbPageState,
    filter?: V
  ): Observable<IbFetchDataResponse<T>>;
}
