import { DataSource } from "@angular/cdk/collections";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, Sort, SortDirection } from "@angular/material/sort";
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  merge,
  of,
} from "rxjs";
import {
  catchError,
  debounceTime,
  map,
  skipWhile,
  startWith,
  switchMap,
} from "rxjs/operators";
import { IbKaiTableState } from "./table.types";

export class IbRemoteTableDataSource<
  T,
  P extends MatPaginator = MatPaginator
> extends DataSource<T> {
  /** Stream that emits when a new data array is set on the data source. */
  private readonly _data: BehaviorSubject<T[]>;

  /** Stream emitting render data to the table (depends on ordered data changes). */
  // private readonly _renderData = new BehaviorSubject<T[]>([]);

  /** Stream that emits when a new filter string is set on the data source. */
  private readonly _filter = new BehaviorSubject<any>({});

  /** Used to react to internal changes of the paginator that are made by the data source itself. */
  // private readonly _internalPageChanges = new Subject<void>();

  private readonly _refresh = new Subject<void>();

  _renderChangesSubscription: Subscription | null = null;

  get data() {
    return this._data.value;
  }

  set data(data: T[]) {
    data = Array.isArray(data) ? data : [];
    this._data.next(data);
  }

  /** MatTableDataSource compat */
  get filteredData() {
    return this._data.value;
  }

  get sort(): MatSort | null {
    return this._sort;
  }

  set sort(sort: MatSort | null) {
    this._sort = sort;
    this._updateChangeSubscription();
  }

  private _sort: MatSort | null;

  get paginator(): P | null {
    return this._paginator;
  }

  set paginator(paginator: P | null) {
    this._paginator = paginator;
    this._updateChangeSubscription();
  }

  private _paginator: P | null;

  get state() {
    return this._state.value;
  }

  set state(value) {
    this._state.next(value);
  }

  _state = new BehaviorSubject<IbKaiTableState>('idle');

  get filter() {
    return this._filter.value;
  }

  set filter(value) {
    this._filter.next(value);
    this._refresh.next();
  }

  constructor(initialData: T[] = []) {
    super();
    this._data = new BehaviorSubject<T[]>(initialData);
    this._updateChangeSubscription();
  }

  _updateChangeSubscription() {
    const sortChange: Observable<Sort | null | void> = this._sort
      ? (merge(
          this._sort.sortChange,
          this._sort.initialized
        ) as Observable<Sort | void>)
      : of(null);

    const pageChange: Observable<PageEvent | null | void> = this._paginator
      ? (merge(
          this._paginator.page,
          // this._internalPageChanges,
          this._paginator.initialized
        ) as Observable<PageEvent | void>)
      : of(null);

    if (sortChange && this._paginator) {
      sortChange.subscribe(() => (this._paginator.pageIndex = 0));
    }

    const dataChange = merge(this._refresh, sortChange, pageChange).pipe(
      startWith([]),
      skipWhile(
        () => this._sort === undefined || this._paginator === undefined
      ),
      debounceTime(0),
      switchMap(() => {
        this.state = 'loading';
        return this.fetchData(
          this._sort.active,
          this._sort.direction,
          this._paginator.pageIndex,
          this.filter
        ).pipe(
          catchError(() => {
            this.state = 'http_error';
            return of(null);
          })
        );
      }),
      map((data) => {
        if (data === null || data === undefined) {
          return [];
        }

        this.state = 'idle';
        this._paginator.length = this.updatePaginator(data);
        return this.mapData(data);
      })
    );

    this._renderChangesSubscription?.unsubscribe();
    this._renderChangesSubscription = dataChange.subscribe((data) =>
      this._data.next(data)
    );
  }

  connect(): Observable<readonly T[]> {
    if (!this._renderChangesSubscription) {
      this._updateChangeSubscription();
    }

    return this._data;
  }

  disconnect(): void {
    this._data?.unsubscribe();
    this._renderChangesSubscription?.unsubscribe();
  }

  filterPredicate() {}

  fetchData(
    sort: string,
    order: SortDirection,
    page: number,
    filter: Record<string, any>
  ): Observable<any> {
    return of(this.data);
  }

  mapData(result: any): T[] {
    return result;
  }

  refresh() {
    this._refresh.next();
  }

  updatePaginator(result: any): number {
    return this.mapData(result).length + 1;
  }
}
