import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import type { IbTableRemoteDataSource } from "./remote-data-source";

export type IbTableData<T> = {
  data: T[];
  totalCount: number;
};

/**
 * Implement this interface in a service
 * in order to promote it as a data provider for {@link IbTableRemoteDataSource}
 */
export interface IbTableDataProvider<T, V = Record<string, any>> {
  /**
   * Data fetching strategy
   *
   * ```
   * \@Injectable()
   * class ProductService implements IbTableDataProvider<Product> {
   *   constructor(private http: HttpClient) {}
   *
   *   fetchData(
   *     sort: MatSort,
   *     page: MatPaginator,
   *     filter
   *   ): Observable<IbTableData<Product>> {
   *       const params = new URLSearchParams();
   *       return this.http.get("/products", {
   *         params: {
   *           sort: sort.active,
   *           order: sort.direction,
   *           page: page.pageIndex + 1,
   *           per_page: page.pageSize
   *         }
   *       }).pipe(
   *         map((result) => ({
   *           data: result.items,
   *           totalCount: result.total_count
   *         }))
   *       );
   *   }
   * }
   * ```
   *
   * @param sort Current sort state
   * @param page Current page number
   * @param filter Current filter applied
   * @returns Observable of data and total count
   */
  fetchData(
    sort: MatSort,
    page: MatPaginator,
    filter: V
  ): Observable<IbTableData<T>>;
}
