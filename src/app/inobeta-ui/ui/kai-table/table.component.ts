import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { BreakpointObserver } from '@angular/cdk/layout';
import { Portal, TemplatePortal } from "@angular/cdk/portal";
import {
  Component,
  DestroyRef,
  HostBinding,
  Injector,
  OnDestroy,
  ViewEncapsulation,
  booleanAttribute,
  contentChild,
  contentChildren,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { takeUntilDestroyed, toObservable, toSignal } from "@angular/core/rxjs-interop";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { IbActionColumn, IbKaiTableAction, IbKaiTableActionGroup } from ".";
import { IbDataExportService, IDataExportSettings } from "../data-export";
import { IbFilter, IbFilterBase } from "../kai-filter";
import { IbTableViewsHost } from "./table-views-host";
import { IbColumn } from "./columns/column";
import { IbSelectionColumn } from "./columns/selection-column";
import { IbTableRemoteDataSource } from "./remote-data-source";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbTableDataSource } from "./table-data-source";
import { IbKaiTableSnapshot, IbKaiTableState, IbTableDef } from "./table.types";
import { IB_TABLE } from "./tokens";
import { IbKaiTableStateFacade } from "./table-state.facade";
import { IbDataSourceCapability } from "./data-source.types";

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
  providers: [
    { provide: IB_TABLE, useExisting: IbTable },
    IbKaiTableStateFacade,
  ],
  encapsulation: ViewEncapsulation.None,
  standalone: false
})
export class IbTable implements OnDestroy {
  readonly initialized = signal(false);
  private readonly remoteState = signal<IbKaiTableState | null>(null);
  private readonly internalDataSource = new IbTableDataSource<unknown>([]);
  private applyingSnapshot = false;
  private snapshotAppliedSource: IbTableDataSource<unknown> | IbTableRemoteDataSource<unknown> | null = null;
  private snapshotAppliedState: IbKaiTableSnapshot | null = null;
  /**
   *
   * MOBILE STUFF
   */
  columns = contentChildren(IbColumn);
  selectionColumn = contentChild(IbSelectionColumn);
  rowGroup = contentChild(IbKaiRowGroupDirective);
  filter = contentChild(IbFilter);
  viewHost = contentChild(IbTableViewsHost);
  filters = contentChildren(IbFilterBase, { descendants: true });
  headerActions = contentChildren(IbKaiTableAction, { descendants: true });
  actionColumn = contentChild(IbActionColumn);
  actionGroup = contentChild(IbKaiTableActionGroup);
  private breakpointObserver = inject(BreakpointObserver);
  isMobile = this.breakpointObserver.isMatched('(max-width: 767px)');
  @HostBinding('class.ib-table__container')
  get hasTableContainerClass(): boolean {
    return !this.isMobile;
  }
  /** END MOBILE STUFF */



  /** @internal Signal-based view query — access via {@link matTable} getter. */
  readonly __matTable = viewChild(MatTable);
  /** @internal Signal-based view query — access via {@link sort} getter. */
  readonly __sort = viewChild(MatSort);
  /** @internal Signal-based view query — access via {@link paginator} getter. */
  readonly __paginator = viewChild(MatPaginator);

  /** @deprecated Backward-compatible accessor for child components. Will be removed in Step 15 migration. */
  get matTable(): MatTable<any> { return this.__matTable()!; }
  /** @deprecated Backward-compatible accessor for child components. Will be removed in Step 15 migration. */
  get sort(): MatSort { return this.__sort()!; }
  /** @deprecated Backward-compatible accessor for child components. Will be removed in Step 15 migration. */
  get paginator(): MatPaginator { return this.__paginator()!; }

  expandedElement: any;
  actionPortals: Portal<any>[] = [];

  readonly __state = input<IbKaiTableState>('idle');
  data = input<unknown[] | undefined>(undefined);
  /** @internal — use {@link dataSource} getter or {@link activeDataSource} signal. */
  readonly __dataSource = input<IbTableDataSource<unknown> | IbTableRemoteDataSource<unknown> | undefined>(undefined, { alias: 'dataSource' });
  readonly __tableName = input.required<string>({ alias: 'tableName' });
  tableDef = input<Partial<IbTableDef>>({});
  /** @internal — use {@link displayedColumns} getter or {@link effectiveDisplayedColumns} signal. */
  readonly __displayedColumns = input<string[]>([], { alias: 'displayedColumns' });
  stripedRows = input(false, { transform: booleanAttribute });
  activeRowParams = input<{ dataParamId: string, childRouteParamId: string }>({ dataParamId: null, childRouteParamId: null });

  /** @deprecated Backward-compatible accessor for child components. Will be removed in Step 15 migration. */
  get dataSource(): IbTableDataSource<unknown> | IbTableRemoteDataSource<unknown> | undefined { return this.activeDataSource(); }
  /** @deprecated Backward-compatible accessor for child components. Will be removed in Step 15 migration. */
  get tableName(): string { return this.__tableName(); }
  /** @deprecated Backward-compatible accessor for child components. Will be removed in Step 15 migration. */
  get displayedColumns(): string[] { return this.effectiveDisplayedColumns(); }

  /** @deprecated Backward-compatible accessor for child components. Will be removed in Step 15 migration. */
  get state(): IbKaiTableState { return this.__state(); }

  readonly effectiveTableDef = computed<IbTableDef>(() => ({
    ...defaultTableDef,
    ...this.tableDef(),
    paginator: {
      ...defaultTableDef.paginator,
      ...this.tableDef().paginator,
    },
  }));
  readonly activeDataSource = computed<IbTableDataSource<unknown> | IbTableRemoteDataSource<unknown>>(() => {
    const data = this.data();
    const dataSource = this.__dataSource();
    if (data !== undefined && dataSource !== undefined) {
      throw new Error('[IbTable] [data] and [dataSource] cannot be used together.');
    }
    if (data !== undefined) this.internalDataSource.data = data;
    return dataSource ?? this.internalDataSource;
  });
  readonly effectiveDisplayedColumns = computed(() => {
    const columns = [...this.__displayedColumns()];
    if (this.selectionColumn() && !columns.includes('ib-selection')) columns.unshift('ib-selection');
    if (this.columns().some((column) => column.name() === 'ib-action') && !columns.includes('ib-action')) columns.push('ib-action');
    return columns;
  });
  readonly canExportAllRows = computed(() => this.hasCapability(IbDataSourceCapability.FullExport));
  readonly shouldDisplayAggregationFooter = computed(() => {
    const source = this.activeDataSource();
    return this.hasCapability(IbDataSourceCapability.GlobalAggregation)
      && !this.isRemoteDataSource(source)
      && Object.keys(source.aggregatedData).length > 0;
  });
  readonly effectiveState = computed(() => this.remoteState() ?? this.__state());
  readonly isDataSourceReady = computed(() =>
    this.initialized() || !this.isRemoteDataSource(this.activeDataSource()),
  );

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private stateFacade = inject(IbKaiTableStateFacade);
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);

  @HostBinding('class.ib-table--has-views') get hasViews() { return !!this.viewHost(); }
  @HostBinding("class.ib-table-striped-rows") get hasStripedRows() { return this.stripedRows(); }
  activeRouteId = signal<string>(null);

  exportService: IbDataExportService = inject(IbDataExportService);
  private viewSubscription: Subscription | null = null;

  constructor() {
    const currentRoute = toSignal(this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ));
    effect(() => {
      const current = currentRoute();
      const childRouteId = this.activeRowParams()?.childRouteParamId
      if (childRouteId) {
        const activeId = this.activatedRoute.firstChild?.snapshot.paramMap.get(childRouteId);
        this.activeRouteId.set(activeId);
      } else {
        this.activeRouteId.set(null);
      }
    });
    effect((onCleanup) => {
      const source = this.activeDataSource();
      this.remoteState.set(null);
      if (!this.isRemoteDataSource(source)) return;
      const subscription = source._state.subscribe((currentState) => this.remoteState.set(currentState));
      onCleanup(() => subscription.unsubscribe());
    });
    effect(() => {
      if (!this.initialized()) return;
      const snapshot = this.stateFacade.snapshot();
      const source = this.activeDataSource();
      if (source === this.snapshotAppliedSource && snapshot === this.snapshotAppliedState) return;
      this.applyingSnapshot = true;
      try {
        untracked(() => this.applySnapshot(source, snapshot));
      } finally {
        this.applyingSnapshot = false;
      }
      this.snapshotAppliedSource = source;
      this.snapshotAppliedState = snapshot;
    });
    effect((onCleanup) => {
      if (!this.initialized()) return;
      const source = this.activeDataSource();
      const paginator = this.__paginator();
      if (!paginator || !this.isRemoteDataSource(source)) return;
      const subscription = source.totalCount$.subscribe((totalCount) => {
        paginator.length = totalCount;
      });
      onCleanup(() => subscription.unsubscribe());
    });
    effect(() => {
      if (!this.initialized()) return;
      const source = this.activeDataSource();
      if (!this.isRemoteDataSource(source)) {
        source.columns = [...this.columns()];
        source.applySortOnColumn(this.effectiveDisplayedColumns());
      }
    });
    effect((onCleanup) => {
      if (!this.initialized()) return;
      const sort = this.__sort();
      const tableFilter = this.filter();
      const subscriptions: Subscription[] = [];
      if (sort) subscriptions.push(sort.sortChange.subscribe((value) => {
        if (!this.applyingSnapshot) this.stateFacade.setSort(value);
      }));
      if (tableFilter) subscriptions.push(tableFilter.ibFilterUpdated.subscribe(() => this.stateFacade.setFilters(tableFilter.value)));
      onCleanup(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));
    });
  }

  async ngAfterContentInit(): Promise<void> {
    await this.stateFacade.initialize(this.__tableName(), this.effectiveTableDef(), this.viewHost());
    const viewHost = this.viewHost();
    if (viewHost) {
      viewHost.setViewGroupName(this.__tableName());
      viewHost.setViewDataAccessor(() => this.getViewData());
      viewHost.handleStateChanges(
        toObservable(this.stateFacade.snapshot, { injector: this.injector })
          .pipe(takeUntilDestroyed(this.destroyRef)),
      );
      const source = this.activeDataSource();
      if (!this.isRemoteDataSource(source)) source.view = viewHost;
      this.viewSubscription = viewHost.activeViewChanged.subscribe((view) => {
        this.stateFacade.applyView(view.viewId, {
          sort: view.sort?.active ? view.sort : null,
          filters: view.filters ?? view.filter ?? null,
          pageSize: view.pageSize,
          aggregatedColumns: view.aggregatedColumns,
        });
      });
      this.setupViewGroup();
    }
    this.initialized.set(true);
  }

  ngOnDestroy() {
    this.viewSubscription?.unsubscribe();
    this.stateFacade.destroy();
  }

  setPaginatorState(params: { pageIndex: number; pageSize: number }): void {
    this.stateFacade.setPaginator(params.pageIndex, params.pageSize);
  }
  private setupViewGroup() {
    const tableFilter = this.filter();
    const viewHost = this.viewHost();
    if (!tableFilter?.hideFilterAction || !viewHost) return;
    this.actionPortals.push(
      new TemplatePortal(tableFilter.hideFilterAction.templateRef(), tableFilter.hideFilterAction.viewContainerRef)
    );
    this.actionPortals.push(...viewHost.toolbarPortals);
  }

  doExport(settings: Partial<IDataExportSettings>): void {
    if (!this.isExportSettings(settings)) return;
    const source = this.activeDataSource();
    if (this.isRemoteDataSource(source)) return;
    this.exportService._exportFromTable(
      this.__tableName(),
      source,
      settings
    );
  }

  updateSortFromMobile(newSort: Sort): void {
    this.stateFacade.setSort(newSort);
    const source = this.activeDataSource();
    if (this.isRemoteDataSource(source)) return;
    const sort = this.__sort();
    if (!sort) return;
    sort.active = newSort.active;
    sort.direction = newSort.direction;
    sort.sortChange.emit(newSort);
  }

  tableDataSource(): IbTableDataSource<unknown> | IbTableRemoteDataSource<unknown> {
    return this.activeDataSource();
  }

  dataSourceForMobile(): IbTableDataSource<unknown> {
    return this.activeDataSource() as unknown as IbTableDataSource<unknown>;
  }

  /** @deprecated Backward-compatible accessor for child components. Will be removed in Step 15 migration. */
  get isRemote(): boolean { return this.isRemoteDataSource(this.activeDataSource()); }

  private applySnapshot(
    source: IbTableDataSource<unknown> | IbTableRemoteDataSource<unknown>,
    snapshot: IbKaiTableSnapshot,
  ): void {
    const paginator = this.__paginator();
    const sort = this.__sort();
    const tableFilter = this.filter();
    if (paginator) {
      paginator.pageIndex = snapshot.pageIndex;
      paginator.pageSize = snapshot.pageSize;
    }
    if (tableFilter && snapshot.filters) tableFilter.value = snapshot.filters as never;
    if (this.isRemoteDataSource(source)) {
      source.setInput({ sort: snapshot.sort, pageIndex: snapshot.pageIndex, pageSize: snapshot.pageSize, filter: snapshot.filters });
      return;
    }
    source.tableName = this.__tableName();
    source.selectionColumn = this.selectionColumn() ?? null;
    source.filter = tableFilter ?? null;
    source.aggregatedColumns = snapshot.aggregatedColumns;
    source.sort = sort ?? null;
    source.paginator = paginator ?? null;
    const snapshotSort = snapshot.sort ?? { active: '', direction: '' };
    if (
      source.sortState.active !== snapshotSort.active
      || source.sortState.direction !== snapshotSort.direction
    ) {
      source.initializeSortState(snapshotSort);
    }
  }

  private getViewData() {
    const snapshot = this.stateFacade.snapshot();
    return {
      filter: (this.filter()?.value ?? {}) as never,
      filters: snapshot.filters,
      pageSize: snapshot.pageSize,
      aggregatedColumns: snapshot.aggregatedColumns,
      sort: snapshot.sort ?? { active: '', direction: '' },
    };
  }

  private isRemoteDataSource(source: IbTableDataSource<unknown> | IbTableRemoteDataSource<unknown>): source is IbTableRemoteDataSource<unknown> {
    return 'request$' in source;
  }

  private hasCapability(capability: IbDataSourceCapability): boolean {
    const source = this.activeDataSource();
    if ('capabilities' in source) return source.capabilities.has(capability);
    return !this.isRemoteDataSource(source);
  }

  private isExportSettings(settings: Partial<IDataExportSettings>): settings is IDataExportSettings {
    return settings.format !== undefined && settings.dataset !== undefined;
  }
}
