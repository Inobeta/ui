import { PageEvent } from "@angular/material/paginator";
import { Sort } from "@angular/material/sort";
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  combineLatest,
  merge,
  of,
} from "rxjs";
import {
  catchError,
  debounceTime,
  map,
  skipWhile,
  switchMap,
} from "rxjs/operators";
import { IbTableDataProvider } from "./remote-data-provider";
import { IbTableDataSource } from "./table-data-source";
import { IbKaiTableState } from "./table.types";

export class IbTableRemoteDataSource<T> extends IbTableDataSource<T> {
  private _refresh = new Subject<void>();

  _renderChangesSubscription: Subscription | null = null;

  set filter(value) {
    super.filter = value;
    this._refresh.next();
  }

  get state() {
    return this._state.value;
  }

  set state(value) {
    this._state.next(value);
  }

  readonly _state = new BehaviorSubject<IbKaiTableState>("idle");

  constructor(private dataService: IbTableDataProvider<T>) {
    super([]);
  }

  _updateChangeSubscription() {
    if (!this._state) {
      return;
    }

    const sortChange: Observable<Sort | null | void> = this.sort
      ? (merge(
          this.sort.sortChange,
          this.sort.initialized
        ) as Observable<Sort | void>)
      : of(null);

    const pageChange: Observable<PageEvent | null | void> = this.paginator
      ? (merge(
          this.paginator.page,
          // this._internalPageChanges,
          this.paginator.initialized
        ) as Observable<PageEvent | void>)
      : of(null);

    const refresh = this._refresh?.asObservable();
    const pipeline = combineLatest([this._filter, sortChange, pageChange]);

    const dataChange = merge(refresh, pipeline).pipe(
      switchMap(() => {
        this.state = "loading";
        return this.dataService
          .fetchData(this.sort, this.paginator, super.filter)
          .pipe(
            catchError(() => {
              this.state = "http_error";
              return of(null);
            })
          );
      }),
      map((result) => {
        if (result === null || result === undefined) {
          return [];
        }

        this.state = "idle";
        this.paginator.length = result.totalCount;
        return result.data;
      }),
      map((data) => this._filterData(data))
    );

    this._renderChangesSubscription?.unsubscribe();
    this._renderChangesSubscription = dataChange.subscribe((data) =>
      this._renderData.next(data)
    );
  }

  refresh() {
    this._refresh.next();
  }

  /** Disable _filterData */
  _filterData(data: T[]): T[] {
    return (this.filteredData = data);
  }
}
