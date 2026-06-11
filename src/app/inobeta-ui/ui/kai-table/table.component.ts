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
  Injector,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable, Subject, merge } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { IbActionColumn, IbKaiTableAction, IbKaiTableActionGroup } from ".";
import { IbDataExportService } from "../data-export";
import { IbFilter, IbFilterBase, IbFilterSyntaxExtended } from "../kai-filter";
import { IbTableViewGroup, IbViewSnapshot } from "../views";
import { IbColumn } from "./columns/column";
import { IbSelectionColumn } from "./columns/selection-column";
import { IbTableRemoteDataSource } from "./remote-data-source";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { ibTableSelectLastQueryStringRaw } from "./store";
import { urlStateActions } from "./store/url-state/actions";
import { IbTableDataSource } from "./table-data-source";
import { IbTableQsParams, IbTableUrlService } from "./table-url.service";
import { IbKaiTableState, IbTableDef } from "./table.types";
import { IB_TABLE } from "./tokens";

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
  private _injector = inject(Injector);
  private _cachedFilter: IbFilterSyntaxExtended | null = null;
  private _hasUrlState = false;
  private _viewGroupWired = false;


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
  viewGroup = contentChild(IbTableViewGroup);
  viewIdFromUrl = signal<string | null>(null);
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
  tableStateChange$: Observable<unknown> = new Subject<unknown>();

  @Input() state: IbKaiTableState = "idle";

  @Input()
  set data(data: any[]) {
    this.dataSource.data = data;
  }

  @Input()
  dataSource: IbTableDataSource<unknown> = new IbTableDataSource([]);

  @Input() tableName: string = btoa(
    window.location.pathname + window.location.hash
  );

  tableUrl = inject(IbTableUrlService);
  private store = inject(Store);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

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

  isRemote = false;


  activeRowParams = input<{ dataParamId: string, childRouteParamId: string }>({ dataParamId: null!, childRouteParamId: null! })
  activeRouteId = signal<string>(null!);

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
        this.activeRouteId.set(activeId!);
      } else {
        this.activeRouteId.set(null!);
      }
    })
  }
  ngOnInit() {
    this.viewIdFromUrl.set(this.tableUrl.getActiveView(this.tableName));
    const hasUrlState = !!this.activatedRoute.snapshot.queryParams?.[this.tableName];
    this._hasUrlState = hasUrlState;
    if (hasUrlState) {
      const paginatorFromUrl = this.tableUrl.getPaginator(this.tableName);
      this.tableDef.paginator = {
        ...this.tableDef.paginator,
        ...paginatorFromUrl,
      }
    } else {
      const cachedQueryStringRaw = this.store.selectSignal(ibTableSelectLastQueryStringRaw(this.tableName))();
      const hasCachedFilters = cachedQueryStringRaw?.ibfilter != null;
      const hasCachedPagination = cachedQueryStringRaw?.ibpage != null || cachedQueryStringRaw?.ibpagesize != null;

      if (hasCachedFilters || hasCachedPagination) {
        if (cachedQueryStringRaw?.ibpagesize != null) {
          this.tableDef.paginator!.pageSize = cachedQueryStringRaw.ibpagesize;
        }

        if (cachedQueryStringRaw?.ibfilter != null) {
          this._cachedFilter = cachedQueryStringRaw.ibfilter;
        }
      }
    }
    this.dataSource.tableName = this.tableName;
    this.dataSource.paginator = this.paginator;


    if (this.dataSource instanceof IbTableRemoteDataSource) {
      this.isRemote = true;
      this.dataSource._state
        .pipe(takeUntil(this._destroyed))
        .subscribe((s) => (this.state = s));
    }
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
      this.dataSource.initializeSortState(sortState);
    }


    this.dataSource.selectionColumn = this.selectionColumn;
    this.dataSource.filter = this.filter;
    this.filter?.initialized.subscribe(() => {
      this.tableUrl.emptyFilterSchema[this.tableName] = structuredClone(this.filter.initialRawValue);
      //NG0100
      setTimeout(() => {
        dsInit();
        this._initializeTableStateChange();
      });

      if (this._cachedFilter !== null && !this._hasUrlState) {
        this.filter.value = this._cachedFilter;
      } else {
        const filtersFromUrl = this.tableUrl.getFilters(this.tableName);
        this.filter.value = filtersFromUrl;
      }
    })

    if (this.filter) {
      this.filter.ibFilterUpdated.pipe(takeUntil(this._destroyed)).subscribe((v) => {
        console.debug('[IbTable] direct subscription filter.ibFilterUpdated ->', v);
      });
    }

    if (!this.filter) {
      setTimeout(() => {
        dsInit();
        this._initializeTableStateChange();
      });
    }
    this.dataSource.columns = this.columns.toArray();
    this.dataSource.applySortOnColumn(this.displayedColumns);
    this.columns.changes
      .pipe(takeUntil(this._destroyed))
      .subscribe((columns) => {
        this.dataSource.columns = columns.toArray();
        this.dataSource.applySortOnColumn(this.displayedColumns);
      });

    effect(() => {
      const viewGroup = this.viewGroup();
      if (!viewGroup) {
        return;
      }

      viewGroup.initialViewId.set(this.viewIdFromUrl());

      if (!this._viewGroupWired) {
        this._viewGroupWired = true;
        viewGroup.ibViewChanged
          .pipe(takeUntil(this._destroyed))
          .subscribe((view) => this.applyViewToTable(view));
      }
    }, { injector: this._injector });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  setPaginatorState(params: any) {
    this.store.dispatch(urlStateActions.setPaginator({ tableName: this.tableName, params }))
  }

  private _initializeTableStateChange(): void {
    console.debug('[IbTable] _initializeTableStateChange called', this.tableName, {
      hasFilter: !!this.filter,
      paginator: !!this.paginator,
      sort: !!this.sort,
    });
    // No aggregation change observable is currently exposed by IbTableDataSource.
    // Forward merged state change emissions into the subject stored in
    // `tableStateChange$` so any earlier consumer (eg. viewGroup.stateChanges$)
    // that holds the original Subject will receive updates.
    const stateChanges: Observable<unknown>[] = [
      this.paginator.page,
      this.sort.sortChange,
    ];

    if (this.filter) {
      stateChanges.unshift(this.filter.ibFilterUpdated);
    }

    const merged = merge(...stateChanges);
    const subject = this.tableStateChange$ as Subject<unknown>;
    merged.pipe(takeUntil(this._destroyed)).subscribe((s) => {
      console.debug('[IbTable] table state change ->', s);
      subject.next(s);
    });
  }

  getCurrentTableState(): unknown {
    return {
      filter: this.filter?.selectedCriteria ?? {},
      pageSize: this.dataSource.paginator?.pageSize ?? 20,
      aggregatedColumns: this.dataSource.aggregatedColumns ?? {},
      sort: {
        active: this.dataSource.sort?.active ?? '',
        direction: this.dataSource.sort?.direction ?? '',
      },
    };
  }

  applyViewToTable(view: IbViewSnapshot) {
    const data = view.data as ReturnType<typeof this.getCurrentTableState>;

    if ((data as any)?.filter && this.filter) {
      this.filter.value = (data as any).filter;
    }

    if (this.dataSource.paginator && typeof (data as any)?.pageSize === 'number') {
      this.dataSource.paginator.pageSize = (data as any).pageSize;
    }

    if ((data as any)?.aggregatedColumns) {
      this.dataSource.aggregatedColumns = { ...(data as any).aggregatedColumns };
    }

    if ((data as any)?.sort && this.dataSource.sort) {
      this.dataSource.sort.active = (data as any).sort.active ?? '';
      this.dataSource.sort.direction = (data as any).sort.direction ?? '';
      this.dataSource.sort.sortChange.emit({
        active: this.dataSource.sort.active,
        direction: this.dataSource.sort.direction,
      });
    }

    this.tableUrl.setViewState(
      this.tableName,
      view.id,
      this.getCurrentTableState() as IbTableQsParams,
    );
  }

  doExport(settings: any) {
    this.exportService._exportFromTable(
      this.tableName,
      this.dataSource,
      settings
    );
  }

  updateSortFromMobile(newSort: MatSort) {
    this.dataSource.sort!.active = newSort.active;
    this.dataSource.sort!.direction = newSort.direction;
    this.dataSource.sort!.sortChange.emit(newSort);
  }
}
