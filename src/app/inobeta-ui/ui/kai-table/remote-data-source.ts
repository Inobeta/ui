import { DataSource } from "@angular/cdk/collections";
import { Sort } from "@angular/material/sort";
import { BehaviorSubject, Observable, Subject, merge, of, timer } from "rxjs";
import { catchError, distinctUntilChanged, map, switchMap } from "rxjs/operators";
import { IbDataSourceCapability } from "./data-source.types";
import { IbKaiTableState, IbTableFilterState } from "./table.types";

export type IbFetchDataResponse<T> = {
  data: T[];
  totalCount: number;
};

export type IbRemoteDataSourceRequest<V = IbTableFilterState> = Readonly<{
  sort: Sort | null;
  pageIndex: number;
  pageSize: number;
  filter: V | null;
}>;

type IbRemoteTrigger<V> = Readonly<{
  request: IbRemoteDataSourceRequest<V>;
  debounceFilter: boolean;
}>;

/** Server-side table data source with cancellable, value-object requests. */
export abstract class IbTableRemoteDataSource<T, V = IbTableFilterState>
  extends DataSource<T> {
  private readonly renderData = new BehaviorSubject<T[]>([]);
  private readonly _totalCount = new BehaviorSubject<number>(0);
  private readonly _error = new BehaviorSubject<unknown>(null);
  private readonly _trigger = new Subject<IbRemoteTrigger<V>>();
  private readonly _refresh = new Subject<void>();
  private initialRequestIssued = false;
  private _request: IbRemoteDataSourceRequest<V> = {
    sort: null,
    pageIndex: 0,
    pageSize: 20,
    filter: null,
  };
  private _lastFilter: V | null = null;

  constructor(readonly filterDebounceMs = 500) {
    super();
    this.connectPipeline();
  }

  readonly capabilities: ReadonlySet<IbDataSourceCapability> = new Set();
  readonly totalCount$ = this._totalCount.asObservable();
  readonly error$ = this._error.asObservable();
  readonly request$ = new BehaviorSubject<IbRemoteDataSourceRequest<V>>(this._request);
  readonly _state = new BehaviorSubject<IbKaiTableState>("idle");

  /** Compatibility read access for the table state binding. */
  get state(): IbKaiTableState {
    return this._state.value;
  }

  get request(): IbRemoteDataSourceRequest<V> {
    return { ...this._request };
  }

  get filteredData(): T[] {
    return this.renderData.value;
  }

  get sortState(): Sort {
    return this._request.sort ?? { active: "", direction: "" };
  }

  get shouldDisplayAggregationFooter(): boolean {
    return false;
  }

  private connectPipeline(): void {
    merge(
      this._trigger,
      this._refresh.pipe(map(() => ({ request: this.request, debounceFilter: false }))),
    )
      .pipe(
        switchMap(({ request, debounceFilter }) => {
          this._state.next("loading");
          this._error.next(null);
          const request$ = debounceFilter ? timer(this.filterDebounceMs).pipe(map(() => request)) : of(request);
          return request$.pipe(
            switchMap((nextRequest) => this.fetchData(nextRequest)),
            catchError((error: unknown) => {
              this._state.next("http_error");
              this._error.next(error);
              return of(null);
            }),
          );
        }),
      )
      .subscribe((result) => {
        if (result === null) return;
        this._totalCount.next(result.totalCount);
        this._state.next(result.data.length === 0 ? "no_data" : "idle");
        this.renderData.next([...result.data]);
      });
  }

  setInput(value: Partial<IbRemoteDataSourceRequest<V>>): void {
    const nextRequest: IbRemoteDataSourceRequest<V> = {
      ...this._request,
      ...value,
    };
    const filterChanged = JSON.stringify(nextRequest.filter) !== JSON.stringify(this._lastFilter);
    this._request = nextRequest;
    this._lastFilter = nextRequest.filter;
    this.request$.next(this.request);
    this.triggerRequest({ request: this.request, debounceFilter: filterChanged });
  }

  refresh(): void {
    this._refresh.next();
  }

  connect(): BehaviorSubject<T[]> {
    if (!this.initialRequestIssued) {
      this.triggerRequest({ request: this.request, debounceFilter: false });
    }
    return this.renderData;
  }

  disconnect(): void {}

  private triggerRequest(trigger: IbRemoteTrigger<V>): void {
    this.initialRequestIssued = true;
    this._trigger.next(trigger);
  }

  abstract fetchData(
    request: IbRemoteDataSourceRequest<V>,
  ): Observable<IbFetchDataResponse<T>>;
}
