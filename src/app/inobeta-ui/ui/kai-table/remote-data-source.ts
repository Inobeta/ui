import { DataSource } from "@angular/cdk/collections";
import { Sort } from "@angular/material/sort";
import { BehaviorSubject, Observable, Subject, Subscription, merge, of, timer } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
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

function areStructurallyEqual(left: unknown, right: unknown): boolean {
  const traversedObjects = new WeakSet<object>();

  const compare = (leftValue: unknown, rightValue: unknown): boolean => {
    if (leftValue === rightValue) {
      return leftValue === null || leftValue === undefined || typeof leftValue === "string" || typeof leftValue === "boolean" ||
        typeof leftValue === "bigint" || typeof leftValue === "symbol" ||
        (typeof leftValue === "number" && Number.isFinite(leftValue));
    }

    if (typeof leftValue !== typeof rightValue || leftValue === null || rightValue === null) return false;
    if (typeof leftValue !== "object") return false;

    const leftObject = leftValue as object;
    const rightObject = rightValue as object;
    if (traversedObjects.has(leftObject)) return false;
    traversedObjects.add(leftObject);

    try {
      const leftIsArray = Array.isArray(leftObject);
      if (leftIsArray !== Array.isArray(rightObject)) return false;
      if (!leftIsArray && (Object.getPrototypeOf(leftObject) !== Object.prototype || Object.getPrototypeOf(rightObject) !== Object.prototype)) {
        return false;
      }
      if (Object.getOwnPropertySymbols(leftObject).length > 0 || Object.getOwnPropertySymbols(rightObject).length > 0) return false;

      const leftKeys = Object.keys(leftObject);
      const rightKeys = Object.keys(rightObject);
      if (leftKeys.length !== rightKeys.length) return false;

      return leftKeys.every((key) =>
        Object.prototype.hasOwnProperty.call(rightObject, key) && compare(
          (leftObject as Record<string, unknown>)[key],
          (rightObject as Record<string, unknown>)[key],
        ),
      );
    } catch {
      return false;
    } finally {
      traversedObjects.delete(leftObject);
    }
  };

  return compare(left, right);
}

/** Server-side table data source with cancellable, value-object requests. */
export abstract class IbTableRemoteDataSource<T, V = IbTableFilterState>
  extends DataSource<T> {
  private readonly renderData = new BehaviorSubject<T[]>([]);
  private readonly _totalCount = new BehaviorSubject<number>(0);
  private readonly _error = new BehaviorSubject<unknown>(null);
  private readonly _trigger = new Subject<IbRemoteTrigger<V>>();
  private readonly _refresh = new Subject<void>();
  private initialRequestIssued = false;
  private consumers = 0;
  private pipelineSubscription: Subscription | null = null;
  private _request: IbRemoteDataSourceRequest<V> = {
    sort: null,
    pageIndex: 0,
    pageSize: 20,
    filter: null,
  };

  constructor(readonly filterDebounceMs = 500) {
    super();
  }

  /**
   * Capabilities this data source advertises to the table renderer.
   *
   * By default the remote source only supports exporting the currently
   * fetched page (`filteredData`); full export, row selection and global
   * aggregation are intentionally absent because the base implementation
   * does not implement them. Subclasses may override this set by redeclaring
   * the property, but must only advertise capabilities whose behavior the
   * subclass actually implements.
   */
  readonly capabilities: ReadonlySet<IbDataSourceCapability> = new Set([
    IbDataSourceCapability.CurrentPageExport,
  ]);
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
    this.pipelineSubscription = merge(
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
    if (areStructurallyEqual(nextRequest, this._request)) return;

    const filterChanged = !areStructurallyEqual(nextRequest.filter, this._request.filter);
    this._request = nextRequest;
    this.request$.next(this.request);
    if (this.consumers > 0) {
      this.triggerRequest({ request: this.request, debounceFilter: filterChanged });
    }
  }

  refresh(): void {
    if (this.consumers > 0) this._refresh.next();
  }

  connect(): BehaviorSubject<T[]> {
    this.consumers++;
    if (!this.pipelineSubscription) this.connectPipeline();
    if (!this.initialRequestIssued) {
      this.triggerRequest({ request: this.request, debounceFilter: false });
    }
    return this.renderData;
  }

  disconnect(): void {
    this.consumers = Math.max(0, this.consumers - 1);
    if (this.consumers === 0) {
      this.pipelineSubscription?.unsubscribe();
      this.pipelineSubscription = null;
      this.initialRequestIssued = false;
      this._state.next('idle');
    }
  }

  private triggerRequest(trigger: IbRemoteTrigger<V>): void {
    this.initialRequestIssued = true;
    this._trigger.next(trigger);
  }

  abstract fetchData(
    request: IbRemoteDataSourceRequest<V>,
  ): Observable<IbFetchDataResponse<T>>;
}
