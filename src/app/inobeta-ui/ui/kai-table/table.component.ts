import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { BreakpointObserver } from '@angular/cdk/layout';
import { Portal } from "@angular/cdk/portal";
import {
  Component,
  ContentChild,
  ContentChildren,
  HostBinding,
  Input,
  OnDestroy,
  QueryList,
  Signal,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  signal,
  untracked,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, SortDirection } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subject, merge, of } from "rxjs";
import { catchError, debounceTime, filter, switchMap, takeUntil } from "rxjs/operators";
import { IbActionColumn, IbKaiTableAction, IbKaiTableActionGroup } from ".";
import { IDataExportSettings, IbDataExportService } from "../data-export";
import { IbFilter, IbFilterBase } from "../kai-filter";
import { IbAggregateResult } from "./cells";
import { IbColumn } from "./columns/column";
import { IbSelectionColumn } from "./columns/selection-column";
// remote data source type no longer directly referenced here
import { IbFilterSyntaxExtended } from '../kai-filter';
import { applyFilter } from "../kai-filter/filters";
import { IbFetchDataResponse, IbPageState, IbRemoteFetchStrategy, IbSortState } from './remote-strategy';
import { IbKaiRowGroupDirective } from "./rowgroup";
import { ibTableSelectUrlState } from "./store";
import { urlStateActions } from "./store/url-state/actions";
import { IbKaiTableNamedParams } from './store/url-state/interfaces';
import { IbTableUrlService } from "./table-url.service";
import { IbKaiTableState, IbTableDef } from "./table.types";
import { IB_AGGREGATE, IB_TABLE } from "./tokens";

const defaultTableDef: IbTableDef = {
  paginator: {
    pageSizeOptions: [10, 20, 50, 100],
    showFirstLastButtons: true,
    pageSize: 20,
  },
};

/**
 * Minimal legacy data-source shim used by the desktop table to interoperate with
 * older code that expects a datasource-like object. Intentionally omits
 * the legacy apply-sort helper so that missing-method type errors surface for
 * callers that still invoke it (they are addressed in a later step).
 */
interface IbTableDataSourceShim {
  data: unknown[];
  filteredData: unknown[];
  sortedColumns: string[];
  filterPredicate?: (r: unknown, f: IbFilterSyntaxExtended | undefined) => boolean;
  _orderData?: (d: unknown[]) => unknown[];
  _pageData?: (d: unknown[]) => unknown[];
  tableName?: string;
  paginator?: MatPaginator | undefined;
  selectionColumn?: IbSelectionColumn | undefined;
  filter?: IbFilter | undefined;
  columns?: IbColumn<any>[];
  sort?: MatSort;
  aggregatedColumns?: Record<string, string> | undefined;
}

@Component({
  selector: "ib-kai-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
    ]),
  ],
  providers: [{ provide: IB_TABLE, useExisting: IbTable }],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class IbTable implements OnDestroy {
  private _destroyed = new Subject<void>();

  /** Aggregation state moved to the table */
  aggregatedData: Record<string, IbAggregateResult> = {};
  aggregatedColumns: Record<string, string> = {};
  aggregate = new Subject<{ columnName: string; function: string }>();
  aggregationFunctions = inject(IB_AGGREGATE);


  /**
   *
   * MOBILE STUFF
   */
  mobileColumns = contentChildren(IbColumn);
  mobileRowGroup = contentChild(IbKaiRowGroupDirective);
  mobileFilter = contentChild(IbFilter);
  mobileFilters = contentChildren(IbFilterBase, { descendants: true });
  mobileHeaderActions = contentChildren(IbKaiTableAction, { descendants: true });
  mobileActionColumn = contentChild(IbActionColumn);
  mobileActionGroup = contentChild(IbKaiTableActionGroup);
  private breakpointObserver = inject(BreakpointObserver);
  isMobile = this.breakpointObserver.isMatched('(max-width: 767px)');
  @HostBinding('class.ib-table__container')
  get hasTableContainerClass(): boolean {
    return !this.isMobile;
  }
  /** END MOBILE STUFF */



  @ContentChildren(IbColumn) columns!: QueryList<IbColumn<unknown>>;
  @ContentChild(IbSelectionColumn) selectionColumn!: IbSelectionColumn;
  @ContentChild(IbKaiRowGroupDirective) rowGroup!: IbKaiRowGroupDirective;

  @ContentChild(IbFilter) filter!: IbFilter;


  @ViewChild(MatTable, { static: true }) matTable!: MatTable<unknown>;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  expandedElement: unknown | null = null;
  actionPortals: Portal<unknown>[] = [];

  @Input() state: IbKaiTableState = "idle";

  @Input()
  set data(data: unknown[]) {
    // keep legacy datasource-like object in sync for other consumers/tests
    this.dataSource.data = data;
    this.dataSource.filteredData = Array.isArray(data) ? data : [];
    this._data.set(Array.isArray(data) ? data : []);
  }

  @Input()
  dataSource: IbTableDataSourceShim = {
    data: [],
    filteredData: [],
    sortedColumns: [],
    filterPredicate: (r: unknown, f: IbFilterSyntaxExtended | undefined) => this.filterPredicate(r, f),
    _orderData: (d: unknown[]) => this._orderData(d),
    _pageData: (d: unknown[]) => this._pageData(d),
  };

  @Input() tableName: string = btoa(
    window.location.pathname + window.location.hash
  );

  tableUrl = inject(IbTableUrlService);
  private store = inject(Store);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  // Local reactive signals used to compute the rendered rows
  private _data = signal<unknown[]>([]);
  private _columnsRegistry = signal<IbColumn<unknown>[]>([]);
  private _columnsMap: Record<string, IbColumn<unknown>> = {};
  private _sortedColumns: IbColumn<unknown>[] = [];

  // local pipeline utilities (replaces legacy IbTableDataSource methods)
  private filterPredicate(data: unknown, filter: IbFilterSyntaxExtended | undefined): boolean {
    const { ibSearchBar, ...filters } = (filter || {}) as any;
    const matchesSearchBar = this.applySearchBarFilter(data, ibSearchBar as IbFilterSyntaxExtended | undefined);

    const matches = Object.entries(filters || {}).every(([columnName, condition]) => {
      const column = this._columnsMap[columnName];
      if (!column) {
        throw Error(`ib-filter: column ${columnName} not found`);
      }

      const filterValue = column.filterDataAccessor(data as any, columnName);
      return applyFilter(condition as any, filterValue);
    });

    return matches && matchesSearchBar;
  }

  private applySearchBarFilter(data: unknown, filter: IbFilterSyntaxExtended | undefined) {
    if (!filter) return true;
    const dataStr = Object.keys(data as Record<string, any>)
      .reduce((currentTerm: string, key: string) => {
        const column = this._columnsMap[key];
        const value = column ? column.filterDataAccessor(data as any, key) : (data as any)[key];
        return currentTerm + value + "◬";
      }, "")
      .toLowerCase();

    return applyFilter(filter as any, dataStr);
  }

  public _orderData(data: unknown[]): unknown[] {
    if (!this.sort) return data;
    const active = this.sort.active;
    const direction = this.sort.direction;
    if (!active || !direction) return data;

    const column = this._columnsMap[active];
    if (!column) return data;

    return (data as unknown[]).sort((a: unknown, b: unknown) => {
      let valueA = column.sortingDataAccessor(a as any, active);
      let valueB = column.sortingDataAccessor(b as any, active);

      const valueAType = typeof valueA;
      const valueBType = typeof valueB;
      if (valueAType !== valueBType) {
        if (valueAType === 'number') valueA = valueA + '';
        if (valueBType === 'number') valueB = valueB + '';
      }

      let comparatorResult = 0;
      if (valueA != null && valueB != null) {
        if (valueA > valueB) comparatorResult = 1;
        else if (valueA < valueB) comparatorResult = -1;
      } else if (valueA != null) comparatorResult = 1;
      else if (valueB != null) comparatorResult = -1;

      return comparatorResult * (direction === 'asc' ? 1 : -1);
    });
  }

  public _pageData(data: unknown[]): unknown[] {
    if (!this.paginator) return data;
    const startIndex = (this.paginator as any)["pageIndex"] * (this.paginator as any)["pageSize"];
    return data.slice(startIndex, startIndex + (this.paginator as any)["pageSize"]);
  }

  // Signals derived from the store url state; initialized in ngOnInit when tableName is available
  private _urlState = signal<IbKaiTableNamedParams | undefined>(undefined);
  sortState: Signal<IbSortState>;
  filtersState: Signal<IbFilterSyntaxExtended | undefined>;
  pageState: Signal<number>;
  pageSizeState: Signal<number>;

  // computed output used by the template as the MatTable dataSource
  renderedRows: Signal<unknown[]>;

  // computed filtered length for paginator sync
  private _filteredLength: Signal<number>;

  // helpers for template safety
  getMatSortActive(): string {
    return this.sortState ? (this.sortState()?.active ?? '') : '';
  }

  getMatSortDirection(): SortDirection {
    return this.sortState ? (this.sortState()?.direction ?? '') : '';
  }

  getMobileSortDirection() {
    const dir = this.sortState()?.direction ?? '';
    return {
      ...this.sortState(),
      direction: dir === 'asc' || dir === 'desc' ? dir : 'asc',
    }
  }

  /**
   * Configuration for the table and its inner components. Currently supports only
   * `paginator` and `sort` parameters.
   *
   * If left empty, the following default is used
   *
   * ```
   * {
   *   paginator : {
   *     pageSizeOptions: [10, 20, 50, 100],
   *     showFirstLastButtons: true,
   *     pageSize: 20,
   *     hide: false,
   *   }
   * }
   *
   * NB: querystring override these values
   * ```
   */
  @Input()
  set tableDef(value: Partial<IbTableDef>) {
    this._tableDef = {
      ...defaultTableDef,
      ...value,
      paginator: {
        ...defaultTableDef.paginator,
        ...value?.paginator,
      },
    };
  }
  get tableDef() {
    return this._tableDef;
  }
  private _tableDef: IbTableDef = { ...defaultTableDef };


  /**
   * Columns to be displayed.
   *
   * The order of the columns present in this array is rendered
   * as is in a language written from left-to-right. It is reversed
   * in a language written from right-to-left.
   */
  @Input()
  set displayedColumns(columns: string[]) {
    this._displayedColumns = columns.map((c) => c);
    if (this.selectionColumn) {
      this._displayedColumns.unshift("ib-selection");
    }
    if (this.columns?.find((c) => c.name === "ib-action")) {
      this._displayedColumns.push("ib-action");
    }
  }
  get displayedColumns() {
    return this._displayedColumns;
  }
  private _displayedColumns: string[] = [];

  @HostBinding("class.ib-table-striped-rows")
  @Input({ transform: booleanAttribute })
  stripedRows = false;

  isRemote = computed(() => !!this.remoteSource());

  // Remote fetch inputs & state
  remoteSource = input<IbRemoteFetchStrategy<unknown, unknown>>();
  private _remoteRows = signal<unknown[]>([]);
  private _refresh = new Subject<void>();


  activeRowParams = input<{ dataParamId: string | null, childRouteParamId: string | null }>({ dataParamId: null, childRouteParamId: null })
  activeRouteId = signal<string | null>(null);

  exportService: IbDataExportService = inject(IbDataExportService);

  constructor() {
    const currentRoute = toSignal(this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ));
    effect(() => {
      const current = currentRoute();
      const childRouteId = this.activeRowParams()?.childRouteParamId
      if (childRouteId) {
        const activeId = this.activatedRoute.firstChild?.snapshot.paramMap.get(childRouteId);
        this.activeRouteId.set(activeId ?? null);
      } else {
        this.activeRouteId.set(null);
      }
    })
    // initialize store-derived signals now that tableName is available
    // toSignal requires an injection context; use a signal and subscribe instead
    this.store.select(ibTableSelectUrlState(this.tableName)).pipe(takeUntil(this._destroyed)).subscribe((v) => this._urlState.set(v));
    this.sortState = computed<IbSortState>(() => (this._urlState()?.sort ?? { active: '', direction: 'asc' } as IbSortState));
    this.filtersState = computed<IbFilterSyntaxExtended | undefined>(() => (this._urlState() ? this._urlState()!.filters : undefined));
    // IbKaiTableNamedParams.page is a number (page index)
    this.pageState = computed<number>(() => (this._urlState() ? (this._urlState()!.page as number) : 0));
    this.pageSizeState = computed<number>(() => (this._urlState() ? (this._urlState()!.pageSize as number) : (this.tableDef.paginator?.pageSize ?? 0)));

    // computed rows: choose remote rows when remoteSource is provided otherwise apply client-side pipeline
    this.renderedRows = computed<unknown[]>(() => {
      if (this.remoteSource && this.remoteSource()) {
        return this._remoteRows();
      }

      // client-side pipeline
      const data = this._data();
      const filters = this.filtersState();

      const filtered = !this.filter || !filters ? data : data.filter((r) => this.filterPredicate(r, filters ?? null));

      // sorting: reuse dataSource.sortData if possible by creating a transient MatSort-like object
      const sort = this.sortState();
      let ordered = filtered;
      if (sort && sort.active && sort.direction) {
        const col = this._columnsMap[sort.active];
        if (col) {
          ordered = filtered.slice().sort((a: unknown, b: unknown) => {
            let valueA = col.sortingDataAccessor(a, sort.active);
            let valueB = col.sortingDataAccessor(b, sort.active);

            const valueAType = typeof valueA;
            const valueBType = typeof valueB;
            if (valueAType !== valueBType) {
              if (valueAType === 'number') valueA = valueA + '';
              if (valueBType === 'number') valueB = valueB + '';
            }

            let comparatorResult = 0;
            if (valueA != null && valueB != null) {
              if (valueA > valueB) comparatorResult = 1;
              else if (valueA < valueB) comparatorResult = -1;
            } else if (valueA != null) comparatorResult = 1;
            else if (valueB != null) comparatorResult = -1;

            return comparatorResult * (sort.direction === 'asc' ? 1 : -1);
          });
        }
      }

      const page = this.pageState();
      const pageSize = this.pageSizeState();
      const start = page * pageSize;
      return ordered.slice(start, start + pageSize);
    });

    this._filteredLength = computed(() => {
      const data = this._data();
      const filters = this.filtersState();
      return (!this.filter || !filters) ? data.length : data.filter((r) => this.filterPredicate(r, filters ?? null)).length;
    });
    // dispatch initial sort state from URL snapshot (redux-first)
    const sortFromUrl = this.tableUrl.getSort(this.tableName);
    if (sortFromUrl && sortFromUrl.active !== '' && sortFromUrl.active !== undefined) {
      this.store.dispatch(urlStateActions.setSort({ tableName: this.tableName, params: sortFromUrl }));
    } else if (this.tableDef.initialSort) {
      this.store.dispatch(urlStateActions.setSort({ tableName: this.tableName, params: this.tableDef.initialSort }));
    }
    const hasUrlState = !!this.activatedRoute.snapshot.queryParams?.[this.tableName];
    if (hasUrlState) {
      const paginatorFromUrl = this.tableUrl.getPaginator(this.tableName);
      this.tableDef.paginator = {
        ...this.tableDef.paginator,
        ...paginatorFromUrl,
      }
    }
    this.dataSource.tableName = this.tableName;
    this.dataSource.paginator = this.paginator;

    // initialize aggregation state from URL and wire up aggregate events
    this.aggregatedColumns = this.tableUrl.getAggregatedColumns(this.tableName) || {};
    this.aggregate.pipe(takeUntil(this._destroyed)).subscribe((target) => {
      this.aggregatedColumns[target.columnName] = target.function;
      this.store.dispatch(urlStateActions.setAggregatedColumns({ tableName: this.tableName, params: { ...this.aggregatedColumns } }));

      // Recompute aggregated values for client-side data
      // Replicate dataSource aggregation behavior for current table data
      try {
        const data = this._data();
        // total over filtered data
        for (const [columnName, fun] of Object.entries(this.aggregatedColumns)) {
          const f = this.aggregationFunctions.find((f: any) => f.id === fun);
          if (!f) continue;
          this.aggregatedData[columnName] = {
            ...(this.aggregatedData[columnName] ?? {}),
            total: f.aggregateData(data.map((i: unknown) => (i as any)[columnName])),
          } as IbAggregateResult;
        }

        // current page aggregation
        const page = this.pageState();
        const pageSize = this.pageSizeState();
        const start = page * pageSize;
        const currentPageData = data.slice(start, start + pageSize);
        for (const [columnName, fun] of Object.entries(this.aggregatedColumns)) {
          const f = this.aggregationFunctions.find((f: any) => f.id === fun);
          if (!f) continue;
          this.aggregatedData[columnName] = {
            ...(this.aggregatedData[columnName] ?? {}),
            currentPage: f.aggregateData(currentPageData.map((i: unknown) => (i as any)[columnName])),
          } as IbAggregateResult;
        }
      } catch (e) { }
    });


    // Remote fetch effect: driven by reactive signals (sort, filters, page) + manual refresh
    effect(() => {
      if (!this.remoteSource()) return;

      const sort = this.sortState();
      const page: IbPageState = { pageIndex: this.pageState(), pageSize: this.pageSizeState() };
      const filters = this.filtersState();

      const sub = merge(this._refresh, of(null))
        .pipe(
          debounceTime(300),
          switchMap(() => {
            const remoteSource = this.remoteSource();
            if (!remoteSource) {
              return of({ items: [], totalCount: 0 });
            }
            return remoteSource.fetchData(sort, page, filters).pipe(
              catchError((err) => {
                this.state = 'http_error';
                return of({ items: [], totalCount: 0 });
              })
            )
          }

          ),
          takeUntil(this._destroyed)
        )
        .subscribe((result: IbFetchDataResponse<unknown>) => {
          this._remoteRows.set(Array.isArray(result.items) ? result.items : []);
          this.state = 'idle';
          // update paginator length both in UI and in store
          try {
            untracked(() => {
              if (this.paginator) this.paginator.length = Number(result.totalCount ?? 0);
            });
          } catch { }
          // sync paginator UI length
          // also update url-state paginator with current pageIndex/pageSize
          this.store.dispatch(urlStateActions.setPaginator({ tableName: this.tableName, params: page }));
        });

      return () => sub.unsubscribe();
    });

    // paginator sync effect: write properties in untracked block to avoid change detection cycles
    effect(() => {
      const len = this._filteredLength();
      untracked(() => {
        if (!this.paginator) return;
        this.paginator.length = len as number;
        this.paginator.pageSize = Number(this.pageSizeState());
        (this.paginator as any)["pageIndex"] = Number(this.pageState());
      });
    });
  }

  ngAfterContentInit() {



    const dsInit = () => {
      this.dataSource.sort = this.sort;
      this.dataSource.aggregatedColumns = this.tableUrl.getAggregatedColumns(this.tableName);
      let sortState = {
        ...this.tableDef.initialSort
      };
      const sortFromUrl = this.tableUrl.getSort(this.tableName)
      if (sortFromUrl.active !== '' && sortFromUrl.active !== undefined) {
        sortState = { ...sortFromUrl }
      }
      // initializeSortState will be handled by URL-driven state; do not call here
    }


    this.dataSource.selectionColumn = this.selectionColumn;
    this.dataSource.filter = this.filter;
    this.filter?.initialized.subscribe(() => {
      this.tableUrl.emptyFilterSchema[this.tableName] = structuredClone(this.filter.initialRawValue);
      //NG0100
      setTimeout(() => dsInit())

      const filtersFromUrl = this.tableUrl.getFilters(this.tableName)
      this.filter.value = filtersFromUrl
    })

    // Views support removed for desktop table

    if (!this.filter) {
      setTimeout(() => dsInit())
    }
    this.dataSource.columns = this.columns.toArray();
    const syncColumnsMap = () => {
      // keep registry signal in sync for any consumers
      this._columnsRegistry.set(this.dataSource.columns ?? []);
      // build fast lookup map by column name
      const map: Record<string, IbColumn<unknown>> = {};
      const sorted: IbColumn<unknown>[] = [];
      (this.dataSource.columns ?? []).forEach((c) => {
        if (c && c.name) {
          map[c.name] = c;
          sorted.push(c);
        }
      });
      this._columnsMap = map;
      this._sortedColumns = sorted;
    };

    // initial sync
    syncColumnsMap();

    this.columns.changes
      .pipe(takeUntil(this._destroyed))
      .subscribe((columns) => {
        this.dataSource.columns = columns.toArray();
        syncColumnsMap();
      });

    // subscribe sort changes and forward to store
    this.sort.sortChange.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.store.dispatch(
        urlStateActions.setSort({
          tableName: this.tableName,
          params: { active: this.sort.active ?? '', direction: this.sort.direction ?? '' },
        })
      );
    });

    // subscribe filter updates and forward to store
    this.filter?.ibFilterUpdated.pipe(takeUntil(this._destroyed)).subscribe(() => {
      this.store.dispatch(
        urlStateActions.setFilters({ tableName: this.tableName, params: this.filter?.selectedCriteria ?? {} })
      );
    });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  setPaginatorState(params: { pageIndex: number; pageSize: number }) {
    this.store.dispatch(urlStateActions.setPaginator({ tableName: this.tableName, params }))
  }
  // view group setup removed: views are no longer part of the desktop table

  doExport(settings: Partial<IDataExportSettings>) {
    if (!settings.format) {
      settings.format = 'xlsx';
    }
    // Build a minimal export context to keep export service decoupled from the data source
    const context = {
      filteredData: (this.dataSource.filteredData ?? this._data()) as unknown[],
      sortedColumns: this._sortedColumns,
      _orderData: (data: unknown[]) => this.dataSource._orderData?.(data as any) ?? data,
      _pageData: (data: unknown[]) => this.dataSource._pageData?.(data as any) ?? data,
      selected: this.selectionColumn?.selection?.selected ?? [],
    };

    this.exportService._exportFromTable(this.tableName, context, settings as IDataExportSettings);
  }

  updateSortFromMobile(newSort: MatSort) {
    this.store.dispatch(urlStateActions.setSort({ tableName: this.tableName, params: { active: newSort.active, direction: newSort.direction } }));
  }

  /**
   * Trigger a manual refresh for remoteSource-driven tables
   */
  refresh() {
    if (this.remoteSource && this.remoteSource()) {
      this._refresh.next();
    }
  }

  get hasAggregatedColumns(): boolean {
    return !!this.dataSource?.aggregatedColumns &&
      Object.keys(this.dataSource.aggregatedColumns).length > 0;
  }
}
