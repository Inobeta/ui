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
import { applyFilter } from "../kai-filter/filters";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { ibTableSelectUrlState } from "./store";
import { urlStateActions } from "./store/url-state/actions";
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



  @ContentChildren(IbColumn) columns!: QueryList<IbColumn<any>>;
  @ContentChild(IbSelectionColumn) selectionColumn!: IbSelectionColumn;
  @ContentChild(IbKaiRowGroupDirective) rowGroup!: IbKaiRowGroupDirective;

  @ContentChild(IbFilter) filter!: IbFilter;


  @ViewChild(MatTable, { static: true }) matTable!: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  expandedElement: any;
  actionPortals: Portal<any>[] = [];

  @Input() state: IbKaiTableState = "idle";

  @Input()
  set data(data: any[]) {
    // keep legacy datasource-like object in sync for other consumers/tests
    this.dataSource.data = data;
    this.dataSource.filteredData = Array.isArray(data) ? data : [];
    this._data.set(Array.isArray(data) ? data : []);
  }

  @Input()
  dataSource: any = {
    data: [],
    filteredData: [],
    sortedColumns: [],
    filterPredicate: (r: any, f: any) => this.filterPredicate(r, f),
    _orderData: (d: any[]) => this._orderData(d),
    _pageData: (d: any[]) => this._pageData(d),
  };

  @Input() tableName: string = btoa(
    window.location.pathname + window.location.hash
  );

  tableUrl = inject(IbTableUrlService);
  private store = inject(Store);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  // Local reactive signals used to compute the rendered rows
  private _data = signal<any[]>([]);
  private _columnsRegistry = signal<IbColumn<any>[]>([]);
  private _columnsMap: Record<string, IbColumn<any>> = {};
  private _sortedColumns: IbColumn<any>[] = [];

  // local pipeline utilities (replaces legacy IbTableDataSource methods)
  private filterPredicate(data: any, filter: any): boolean {
    const { ibSearchBar, ...filters } = filter || {};
    const matchesSearchBar = this.applySearchBarFilter(data, ibSearchBar);

    const matches = Object.entries(filters || {}).every(([columnName, condition]) => {
      const column = this._columnsMap[columnName];
      if (!column) {
        throw Error(`ib-filter: column ${columnName} not found`);
      }

      const filterValue = column.filterDataAccessor(data, columnName);
      return applyFilter(condition as any, filterValue);
    });

    return matches && matchesSearchBar;
  }

  private applySearchBarFilter(data: any, filter: any) {
    if (!filter) return true;
    const dataStr = Object.keys(data as Record<string, any>)
      .reduce((currentTerm: string, key: string) => {
        const column = this._columnsMap[key];
        const value = column ? column.filterDataAccessor(data, key) : data[key];
        return currentTerm + value + "◬";
      }, "")
      .toLowerCase();

    return applyFilter(filter, dataStr);
  }

  public _orderData(data: any[]): any[] {
    if (!this.sort) return data;
    const active = this.sort.active;
    const direction = this.sort.direction;
    if (!active || !direction) return data;

    const column = this._columnsMap[active];
    if (!column) return data;

    return data.sort((a: any, b: any) => {
      let valueA = column.sortingDataAccessor(a, active);
      let valueB = column.sortingDataAccessor(b, active);

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

  public _pageData(data: any[]): any[] {
    if (!this.paginator) return data;
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.slice(startIndex, startIndex + this.paginator.pageSize);
  }

  // Signals derived from the store url state; initialized in ngOnInit when tableName is available
  private _urlState = signal<any>(null);
  private urlStateSignal: any;
  sortState: any;
  filtersState: any;
  pageState: any;
  pageSizeState: any;

  // computed output used by the template as the MatTable dataSource
  renderedRows!: Signal<any[]>;

  // computed filtered length for paginator sync
  private _filteredLength!: ReturnType<typeof computed>;

  // helpers for template safety
  getMatSortActive(): string {
    return this.sortState ? (this.sortState()?.active ?? '') : '';
  }

  getMatSortDirection(): SortDirection {
    return this.sortState ? (this.sortState()?.direction ?? '') : '';
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
  remoteSource = input<import('./remote-strategy').IbRemoteFetchStrategy<unknown, unknown>>();
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
  }
  ngOnInit() {
    // initialize store-derived signals now that tableName is available
    // toSignal requires an injection context; use a signal and subscribe instead
    this.store.select(ibTableSelectUrlState(this.tableName)).pipe(takeUntil(this._destroyed)).subscribe((v) => this._urlState.set(v));
    this.urlStateSignal = () => this._urlState();
    this.sortState = computed(() => (this.urlStateSignal() ? this.urlStateSignal().sort : { active: '', direction: '' }));
    this.filtersState = computed(() => (this.urlStateSignal() ? this.urlStateSignal().filters : null));
    this.pageState = computed(() => (this.urlStateSignal() ? this.urlStateSignal().page : { pageIndex: 0 }));
    this.pageSizeState = computed(() => (this.urlStateSignal() ? this.urlStateSignal().pageSize : this.tableDef.paginator?.pageSize));

    // computed rows: choose remote rows when remoteSource is provided otherwise apply client-side pipeline
    this.renderedRows = computed<unknown[]>(() => {
      if (this.remoteSource && this.remoteSource()) {
        return this._remoteRows();
      }

      // client-side pipeline
      const data = this._data();
      const filters = this.filtersState();

      const filtered = !this.filter || !filters ? data : data.filter((r) => this.dataSource.filterPredicate(r as any, filters));

      // sorting: reuse dataSource.sortData if possible by creating a transient MatSort-like object
      const sort = this.sortState();
      let ordered = filtered;
      if (sort && sort.active && sort.direction) {
        const col = this.dataSource.columns[sort.active];
        if (col) {
          ordered = filtered.slice().sort((a: any, b: any) => {
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
      const start = (page?.pageIndex ?? 0) * (pageSize ?? this.tableDef.paginator?.pageSize);
      return ordered.slice(start, start + (pageSize ?? this.tableDef.paginator?.pageSize));
    });

    this._filteredLength = computed(() => {
      const data = this._data();
      const filters = this.filtersState();
      return (!this.filter || !filters) ? data.length : data.filter((r) => this.dataSource.filterPredicate(r as any, filters)).length;
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
            total: f.aggregateData(data.map((i: any) => i[columnName])),
          } as IbAggregateResult;
        }

        // current page aggregation
        const page = this.pageState();
        const pageSize = this.pageSizeState();
        const start = (page?.pageIndex ?? 0) * (pageSize ?? this.tableDef.paginator?.pageSize);
        const currentPageData = data.slice(start, start + (pageSize ?? this.tableDef.paginator?.pageSize));
        for (const [columnName, fun] of Object.entries(this.aggregatedColumns)) {
          const f = this.aggregationFunctions.find((f: any) => f.id === fun);
          if (!f) continue;
          this.aggregatedData[columnName] = {
            ...(this.aggregatedData[columnName] ?? {}),
            currentPage: f.aggregateData(currentPageData.map((i: any) => i[columnName])),
          } as IbAggregateResult;
        }
      } catch (e) { }
    });


    // Remote fetch effect: driven by reactive signals (sort, filters, page) + manual refresh
    effect(() => {
      if (!this.remoteSource()) return;

      const sort = this.sortState();
      const page = { pageIndex: this.pageState()?.pageIndex ?? 0, pageSize: this.pageSizeState?.() ?? this.tableDef.paginator?.pageSize };
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
        .subscribe((result: any) => {
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
          this.store.dispatch(urlStateActions.setPaginator({ tableName: this.tableName, params: { pageIndex: page.pageIndex ?? 0, pageSize: page.pageSize ?? this.tableDef.paginator?.pageSize } }));
        });

      return () => sub.unsubscribe();
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
    this.dataSource.applySortOnColumn(this.displayedColumns);
    this.columns.changes
      .pipe(takeUntil(this._destroyed))
      .subscribe((columns) => {
        this.dataSource.columns = columns.toArray();
        this.dataSource.applySortOnColumn(this.displayedColumns);
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

    // paginator sync effect: write properties in untracked block to avoid change detection cycles
    effect(() => {
      const len = this._filteredLength();
      untracked(() => {
        if (!this.paginator) return;
        this.paginator.length = len as number;
        this.paginator.pageSize = Number(this.pageSizeState?.() ?? this.tableDef.paginator?.pageSize);
        this.paginator.pageIndex = Number(this.pageState?.()?.pageIndex ?? 0);
      });
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
      sortedColumns: this.dataSource.sortedColumns,
      _orderData: (data: unknown[]) => this.dataSource._orderData(data as any),
      _pageData: (data: unknown[]) => this.dataSource._pageData(data as any),
      selected: this.selectionColumn?.selection?.selected ?? [],
    };

    this.exportService._exportFromTable(this.tableName, context, settings as IDataExportSettings);
  }

  updateSortFromMobile(newSort: MatSort) {
    this.dataSource.sort.active = newSort.active;
    this.dataSource.sort.direction = newSort.direction;
    this.dataSource.sort.sortChange.emit(newSort);
  }

  /**
   * Trigger a manual refresh for remoteSource-driven tables
   */
  refresh() {
    if (this.remoteSource && this.remoteSource()) {
      this._refresh.next();
    }
  }
}
