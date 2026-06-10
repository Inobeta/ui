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
  OnInit,
  QueryList,
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
  untracked
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, SortDirection } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Subject, Subscription, merge, of } from "rxjs";
import { catchError, debounceTime, switchMap, takeUntil } from "rxjs/operators";
import { IbActionColumn, IbKaiTableAction, IbKaiTableActionGroup } from ".";
import { IDataExportSettings, IbDataExportService } from "../data-export";
import { IbFilter, IbFilterBase, IbFilterSyntaxExtended } from "../kai-filter";
import { IbAggregateResult } from "./cells";
import { IbColumn } from "./columns/column";
import { IbSelectionColumn } from "./columns/selection-column";
import { IbFetchDataResponse, IbPageState, IbRemoteFetchStrategy, IbSortState } from './remote-strategy';
import { IbKaiRowGroupDirective } from "./rowgroup";
import { ibTableSelectUrlState } from "./store";
import { urlStateActions } from "./store/url-state/actions";
import { IbKaiTableNamedParams } from './store/url-state/interfaces';
import { computeAggregations, filterRows, pageRows, sortRows } from './table-pipeline.utils';
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

// Legacy datasource shim for desktop table interoperability
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
export class IbTable implements OnDestroy, OnInit {
  private _destroyed = new Subject<void>();
  aggregationFunctions = inject(IB_AGGREGATE);
  aggregate = new Subject<{ columnName: string; function: string }>();
  aggregatedData: Record<string, IbAggregateResult> = {};
  aggregatedColumns: Record<string, string> = {};

  // Mobile integration points (content queries)
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

  @ContentChildren(IbColumn) columns?: QueryList<IbColumn<unknown>>;
  @ContentChild(IbSelectionColumn) selectionColumn?: IbSelectionColumn;
  @ContentChild(IbKaiRowGroupDirective) rowGroup?: IbKaiRowGroupDirective;
  @ContentChild(IbFilter) filter?: IbFilter;

  @ViewChild(MatTable, { static: true }) matTable?: MatTable<unknown>;
  @ViewChild(MatSort, { static: true }) sort?: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator?: MatPaginator;

  expandedElement: unknown | null = null;
  actionPortals: Portal<unknown>[] = [];

  @Input() state: IbKaiTableState = "idle";

  @Input()
  set data(data: unknown[]) {
    this.dataSource.data = data;
    this.dataSource.filteredData = Array.isArray(data) ? data : [];
    this._data.set(Array.isArray(data) ? data : []);
  }

  @Input()
  dataSource: IbTableDataSourceShim = {
    data: [],
    filteredData: [],
    sortedColumns: [],
    filterPredicate: (r: unknown, f: IbFilterSyntaxExtended | undefined) => filterRows([r], f ?? null, this._columnsMap).length > 0,
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

  private _data = signal<unknown[]>([]);
  private _columnsRegistry = signal<IbColumn<unknown>[]>([]);
  private _columnsMap: Record<string, IbColumn<unknown>> = {};
  private _sortedColumns: IbColumn<unknown>[] = [];

  private _createRemoteFetchPipeline(
    sort: IbSortState,
    page: IbPageState,
    filters: IbFilterSyntaxExtended | undefined
  ): Subscription {
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
        try {
          untracked(() => {
            if (this.paginator) this.paginator.length = Number(result.totalCount ?? 0);
          });
        } catch { }
        this.store.dispatch(urlStateActions.setPaginator({ tableName: this.tableName, params: page }));
      });
    return sub;
  }

  public _orderData(data: unknown[]): unknown[] {
    return sortRows(data, { active: this.sort?.active, direction: this.sort?.direction }, this._columnsMap);
  }

  public _pageData(data: unknown[]): unknown[] {
    if (!this.paginator) return data;
    const pageIndex = (this.paginator as any)["pageIndex"];
    const pageSize = (this.paginator as any)["pageSize"];
    return pageRows(data, Number(pageIndex), Number(pageSize));
  }

  private _urlState = signal<IbKaiTableNamedParams | undefined>(undefined);

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

  sortState = computed<IbSortState>(() => (this._urlState()?.sort ?? { active: '', direction: 'asc' } as IbSortState));
  filtersState = computed<IbFilterSyntaxExtended | undefined>(() => (this._urlState() ? this._urlState()!.filters : undefined));
  pageState = computed<number>(() => (this._urlState()?.page ? (this._urlState()?.page as number) : 0));
  pageSizeState = computed<number>(() => (this._urlState()?.pageSize ? (this._urlState()?.pageSize as number) : (this.tableDef.paginator?.pageSize ?? 20)));

  renderedRows = computed<unknown[]>(() => {
    if (this.remoteSource && this.remoteSource()) {
      return this._remoteRows();
    }
    const data = this._data();
    const filters = this.filtersState();
    const filtered = !this.filter || !filters ? data : filterRows(data, filters ?? null, this._columnsMap);
    const ordered = sortRows(filtered, this.sortState(), this._columnsMap);
    return pageRows(ordered, this.pageState(), this.pageSizeState());
  });

  private _filteredLength = computed(() => {
    const data = this._data();
    const filters = this.filtersState();
    return (!this.filter || !filters) ? data.length : filterRows(data, filters ?? null, this._columnsMap).length;
  });

  @Input()
  set displayedColumns(columns: string[]) {
    this._displayedColumns = columns.map((c) => c);
    if (this.selectionColumn) {
      this._displayedColumns.unshift("ib-selection");
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

  remoteSource = input<IbRemoteFetchStrategy<unknown, unknown>>();
  private _remoteRows = signal<unknown[]>([]);
  private _refresh = new Subject<void>();

  activeRowParams = input<{ dataParamId: string | null, childRouteParamId: string | null }>({ dataParamId: null, childRouteParamId: null })
  activeRouteId = signal<string | null>(null);

  exportService: IbDataExportService = inject(IbDataExportService);

  constructor() {
    effect(() => {
      const childRouteId = this.activeRowParams()?.childRouteParamId
      if (childRouteId) {
        const activeId = this.activatedRoute.firstChild?.snapshot.paramMap.get(childRouteId);
        this.activeRouteId.set(activeId ?? null);
      } else {
        this.activeRouteId.set(null);
      }
    })
    effect(() => {
      if (!this.remoteSource()) return;

      const sort = this.sortState();
      const page: IbPageState = { pageIndex: this.pageState(), pageSize: this.pageSizeState() };
      const filters = this.filtersState();

      const sub = this._createRemoteFetchPipeline(sort, page, filters);
      return () => sub.unsubscribe();
    });
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

  ngOnInit() {
    this.store.select(ibTableSelectUrlState(this.tableName)).pipe(takeUntil(this._destroyed)).subscribe((v) => this._urlState.set(v));
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
    this.aggregatedColumns = this.tableUrl.getAggregatedColumns(this.tableName) || {};
    this.aggregate.pipe(takeUntil(this._destroyed)).subscribe((target) => {
      this.aggregatedColumns[target.columnName] = target.function;
      this.store.dispatch(urlStateActions.setAggregatedColumns({ tableName: this.tableName, params: { ...this.aggregatedColumns } }));
      try {
        this.aggregatedData = computeAggregations(
          this._data(),
          this.pageState(),
          this.pageSizeState(),
          this.aggregatedColumns,
          this.aggregationFunctions,
          this.aggregatedData,
        );
      } catch (e) {
        console.error(e);
      }
    });
  }

  ngAfterContentInit() {
    this.dataSource.selectionColumn = this.selectionColumn;
    this.dataSource.filter = this.filter;
    this.filter?.initialized.subscribe(() => {
      if (this.filter) {
        this.tableUrl.emptyFilterSchema[this.tableName] = structuredClone(this.filter.initialRawValue);
        const filtersFromUrl = this.tableUrl.getFilters(this.tableName);
        this.filter.value = filtersFromUrl;
      }
    })
    if (this.columns) {
      if (this.columns?.find((c) => c.name === "ib-action")) {
        this._displayedColumns.push("ib-action");
      }
      const initialCols = this.columns.toArray();
      const syncColumnsMap = (cols: IbColumn<unknown>[]) => {
        this._columnsRegistry.set(cols ?? []);
        const map: Record<string, IbColumn<unknown>> = {};
        const sorted: IbColumn<unknown>[] = [];
        (cols ?? []).forEach((c) => {
          if (c && c.name) {
            map[c.name] = c;
            sorted.push(c);
          }
        });
        this._columnsMap = map;
        this._sortedColumns = sorted;
      };
      syncColumnsMap(initialCols);
      this.columns.changes
        .pipe(takeUntil(this._destroyed))
        .subscribe((columns) => {
          syncColumnsMap(columns.toArray());
        });
    }
    if (this.sort) {
      this.sort.sortChange.pipe(takeUntil(this._destroyed)).subscribe(() => {
        this.store.dispatch(
          urlStateActions.setSort({
            tableName: this.tableName,
            params: { active: this.sort?.active ?? '', direction: this.sort?.direction ?? '' },
          })
        );
      });
    }
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

  doExport(settings: Partial<IDataExportSettings>) {
    if (!settings.format) {
      settings.format = 'xlsx';
    }
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

  refresh() {
    if (this.remoteSource && this.remoteSource()) {
      this._refresh.next();
    }
  }

  get hasAggregatedColumns(): boolean {
    return Object.keys(this.aggregatedColumns).length > 0;
  }
}
