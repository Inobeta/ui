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
  ChangeDetectionStrategy
} from "@angular/core";
import { takeUntilDestroyed, toObservable, toSignal } from "@angular/core/rxjs-interop";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { firstValueFrom, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { IbActionColumn, IbKaiTableAction, IbKaiTableActionGroup } from ".";
import { IbDataExportService, IbExportableSource, IDataExportSettings } from "../data-export";
import { IbFilter, IbFilterBase } from "../kai-filter";
import { IbTableViewsHost } from "./table-views-host";
import { IbColumn } from "./columns/column";
import { IbSelectionColumn } from "./columns/selection-column";
import { IbTableRemoteDataSource } from "./remote-data-source";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbKaiTableSnapshot, IbKaiTableState, IbTableDef } from "./table.types";
import { IB_AGGREGATE, IB_TABLE } from "./tokens";
import { IbKaiTableStateFacade } from "./table-state.facade";
import { IbDataSourceCapability, IbTableRendererDataSource } from "./data-source.types";
import { IbTableLocalDataSource } from "./local-data-source";
import { IbAggregate } from "./cells";

type IbTableSource =
  | IbTableLocalDataSource<unknown>
  | IbTableRemoteDataSource<unknown>;

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
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class IbTable implements OnDestroy {
  readonly initialized = signal(false);
  private readonly remoteState = signal<IbKaiTableState | null>(null);
  private readonly currentPageExportAvailable = signal(false);
  private readonly internalDataSource = new IbTableLocalDataSource<unknown>([]);
  private applyingSnapshot = false;
  private snapshotAppliedSource: IbTableSource | null = null;
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



  readonly matTable = viewChild(MatTable);
  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  expandedElement: any;
  actionPortals: Portal<any>[] = [];

  readonly state = input<IbKaiTableState>('idle');
  data = input<unknown[] | undefined>(undefined);
  readonly dataSource = input<IbTableSource | undefined>(undefined);
  readonly tableName = input.required<string>();
  tableDef = input<Partial<IbTableDef>>({});
  readonly displayedColumns = input<string[]>([],);
  readonly tableHeight = input('parent', {
    transform: (value: string | null | undefined): string => value?.trim() ? value : 'parent',
  });
  stripedRows = input(false, { transform: booleanAttribute });
  activeRowParams = input<{ dataParamId: string, childRouteParamId: string }>({ dataParamId: null, childRouteParamId: null });

  readonly usesParentHeight = computed(() => this.tableHeight() === 'parent');
  readonly contentHeight = computed(() => this.usesParentHeight() ? null : this.tableHeight());
  readonly isRemote = computed(() => this.isRemoteDataSource(this.activeDataSource()));

  readonly effectiveTableDef = computed<IbTableDef>(() => ({
    ...defaultTableDef,
    ...this.tableDef(),
    paginator: {
      ...defaultTableDef.paginator,
      ...this.tableDef().paginator,
    },
  }));
  readonly activeDataSource = computed<IbTableSource>(() => {
    const data = this.data();
    const boundDataSource = this.dataSource();
    if (data !== undefined && boundDataSource !== undefined) {
      throw new Error('[IbTable] [data] and [dataSource] cannot be used together.');
    }
    return boundDataSource ?? this.internalDataSource;
  });
  readonly effectiveDisplayedColumns = computed(() => {
    const columns = [...this.displayedColumns()];
    if (this.selectionColumn() && this.canSelectRows() && !columns.includes('ib-selection')) columns.unshift('ib-selection');
    if (this.columns().some((column) => column.name() === 'ib-action') && !columns.includes('ib-action')) columns.push('ib-action');
    return columns;
  });
  readonly canExportAllRows = computed(() => this.hasCapability(IbDataSourceCapability.FullExport));
  readonly canExportCurrentPage = computed(() =>
    this.hasCapability(IbDataSourceCapability.CurrentPageExport) && this.currentPageExportAvailable(),
  );
  readonly canSelectRows = computed(() =>
    this.hasCapability(IbDataSourceCapability.RowSelection) && !!this.selectionColumn(),
  );
  readonly hasExportableDataset = computed(() =>
    this.canExportAllRows() || this.canExportCurrentPage() || this.canSelectRows(),
  );
  readonly shouldDisplayAggregationFooter = computed(() => {
    return this.hasCapability(IbDataSourceCapability.GlobalAggregation)
      && this.effectiveDisplayedColumns().some((name) =>
        this.columns().some((column) => column.name() === name && column.aggregateInput()),
      );
  });
  readonly effectiveState = computed(() => this.remoteState() ?? this.state());
  readonly isDataSourceReady = computed(() =>
    this.initialized() || !this.isRemoteDataSource(this.activeDataSource()),
  );

  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private stateFacade = inject(IbKaiTableStateFacade);
  private injector = inject(Injector);
  private destroyRef = inject(DestroyRef);
  private aggregationFunctions = inject(IB_AGGREGATE, { optional: true }) as IbAggregate[] | null;

  @HostBinding('class.ib-table--has-views') get hasViews() { return !!this.viewHost(); }
  @HostBinding('class.ib-table__container--parent-height') get hasParentHeight() { return this.usesParentHeight(); }
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
    effect(() => {
      const data = this.data();
      if (data !== undefined) this.internalDataSource.data = data;
    });
    effect(() => {
      if (!this.initialized()) return;
      const data = this.data();
      if (data === undefined) return;
      this.filters().forEach((tableFilter) => tableFilter.initializeFromColumn(data));
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
      const paginator = this.paginator();
      if (!paginator || !('totalCount$' in source)) return;
      const subscription = source.totalCount$.subscribe((totalCount) => {
        paginator.length = totalCount;
        this.refreshCurrentPageExportAvailability();
      });
      onCleanup(() => subscription.unsubscribe());
    });
    effect((onCleanup) => {
      if (!this.initialized()) return;
      this.activeDataSource();
      const paginator = this.paginator();
      this.refreshCurrentPageExportAvailability();
      if (!paginator) return;
      const subscription = paginator.page.subscribe(() => this.refreshCurrentPageExportAvailability());
      onCleanup(() => subscription.unsubscribe());
    });
    effect(() => {
      if (!this.initialized()) return;
      const source = this.activeDataSource();
      if (this.isLocalDataSource(source)) {
        source.setColumns([...this.columns()]);
        source.setAggregationFunctions(this.aggregationFunctions ?? []);
      }
    });
    effect((onCleanup) => {
      if (!this.initialized()) return;
      const sort = this.sort();
      const tableFilter = this.filter();
      const subscriptions: Subscription[] = [];
      if (sort) subscriptions.push(sort.sortChange.subscribe((value) => {
        if (!this.applyingSnapshot) this.stateFacade.setSort(value);
      }));
      if (tableFilter) subscriptions.push(
        tableFilter.ibFilterUpdated.subscribe(() => this.stateFacade.setFilters(tableFilter.selectedCriteria)),
      );
      onCleanup(() => subscriptions.forEach((subscription) => subscription.unsubscribe()));
    });

    // Keep the views host highlighted tab in sync with the canonical
    // selectedView on initialization, back/forward, and external changes.
    // syncActiveView is a no-op base implementation that the views host
    // overrides to update its visual selection without emitting
    // activeViewChanged — the one-way nature of this call prevents a
    // feedback loop.
    effect(() => {
      if (!this.initialized()) return;
      const host = this.viewHost();
      if (!host) return;
      host.syncActiveView(this.stateFacade.selectedView());
    });
  }

  async ngAfterContentInit(): Promise<void> {
    // Assign the view group name before initialization so the facade can
    // resolve views against the correct group during resolveView().
    const viewHost = this.viewHost();
    if (viewHost) {
      viewHost.setViewGroupName(this.tableName());
    }

    await this.stateFacade.initialize(this.tableName(), this.effectiveTableDef(), viewHost);
    if (this.destroyRef.destroyed) return;
    const tableFilter = this.filter();
    if (tableFilter) await firstValueFrom(tableFilter.initialized);
    if (this.destroyRef.destroyed) return;

    if (viewHost) {
      // Supply the Default baseline derived from tableDef so the views
      // host can detect dirty state on the implicit "all data" tab.
      viewHost.setDefaultViewBaseline(this.stateFacade.getDefaultViewBaseline());

      viewHost.setViewDataAccessor(() => this.getViewData());
      viewHost.handleStateChanges(
        toObservable(this.stateFacade.snapshot, { injector: this.injector })
          .pipe(takeUntilDestroyed(this.destroyRef)),
      );

      // Synchronize the views UI to the canonical selectedView.  This is
      // a one-way sync: the host updates its highlighted tab but does NOT
      // emit activeViewChanged, preventing a feedback loop.
      viewHost.syncActiveView(this.stateFacade.selectedView());

      this.viewSubscription = viewHost.activeViewChanged.subscribe((view) => {
        // The implicit Default view has no persisted snapshot to resolve.
        // Always apply the table-definition baseline so switching from a
        // named view clears its filters and sort (as well as restoring the
        // other view-owned state), rather than relying on the host's
        // selectedView=null sentinel data.
        const snapshot = view.viewId === null
          ? this.stateFacade.getDefaultViewBaseline()
          : view;
        this.stateFacade.applyView(view.viewId, {
          sort: snapshot.sort?.active ? snapshot.sort : null,
          filters: snapshot.filters !== undefined
            ? snapshot.filters
            : snapshot.filter ?? null,
          pageSize: snapshot.pageSize,
          aggregatedColumns: snapshot.aggregatedColumns,
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
    const viewHost = this.viewHost();
    if (!viewHost) return;

    const tableFilter = this.filter();
    if (tableFilter?.hideFilterAction) {
      this.actionPortals.push(
        new TemplatePortal(tableFilter.hideFilterAction.templateRef(), tableFilter.hideFilterAction.viewContainerRef)
      );
    }
    this.actionPortals.push(...viewHost.toolbarPortals);
  }

  doExport(settings: Partial<IDataExportSettings>): void {
    if (!this.isExportSettings(settings)) return;
    const source = this.activeDataSource();
    if (!this.canExportDataset(settings.dataset)) return;

    const exportableSource = this.createExportableSource(source, settings.dataset);
    const selectedRows = settings.dataset === 'selected' ? exportableSource.filteredData : undefined;
    this.exportService._exportFromTable(
      this.tableName(),
      exportableSource,
      settings,
      selectedRows,
    );
  }

  updateSortFromMobile(newSort: Sort): void {
    this.stateFacade.setSort(newSort);
    const source = this.activeDataSource();
    if (this.isRemoteDataSource(source)) return;
    const sort = this.sort();
    if (!sort) return;
    sort.active = newSort.active;
    sort.direction = newSort.direction;
    sort.sortChange.emit(newSort);
  }

  setAggregation(columnName: string, aggregation: string): void {
    if (!this.hasCapability(IbDataSourceCapability.GlobalAggregation)) return;
    const aggregatedColumns = {
      ...this.stateFacade.aggregatedColumns(),
      [columnName]: aggregation,
    };
    this.stateFacade.setAggregatedColumns(aggregatedColumns);
  }

  tableDataSource(): IbTableRendererDataSource<unknown> {
    return this.activeDataSource();
  }

  dataSourceForMobile(): IbTableRendererDataSource<unknown> {
    return this.activeDataSource();
  }

  tableSortState(): Sort {
    const source = this.rendererDataSource();
    return source.sortState ?? source.input?.sort ?? { active: '', direction: '' };
  }

  private applySnapshot(
    source: IbTableSource,
    snapshot: IbKaiTableSnapshot,
  ): void {
    const paginator = this.paginator();
    const tableFilter = this.filter();
    if (paginator) {
      paginator.pageIndex = snapshot.pageIndex;
      paginator.pageSize = snapshot.pageSize;
      this.refreshCurrentPageExportAvailability();
    }
    if (tableFilter) tableFilter.hydrateRawValue(snapshot.filters as never);
    if (this.isRemoteDataSource(source)) {
      source.setInput({
        sort: snapshot.sort,
        pageIndex: snapshot.pageIndex,
        pageSize: snapshot.pageSize,
        filter: (tableFilter?.query ?? null) as never,
      });
      return;
    }
    source.setInput({
      sort: snapshot.sort,
      rawFilter: tableFilter?.value ?? null,
      pageIndex: snapshot.pageIndex,
      pageSize: snapshot.pageSize,
      aggregatedColumns: snapshot.aggregatedColumns,
    });
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

  private isRemoteDataSource(source: IbTableSource): source is IbTableRemoteDataSource<unknown> {
    return 'request$' in source;
  }

  private isLocalDataSource(source: IbTableSource): source is IbTableLocalDataSource<unknown> {
    return source instanceof IbTableLocalDataSource;
  }

  private rendererDataSource(): IbTableRendererDataSource<unknown> {
    return this.activeDataSource();
  }

  private hasCapability(capability: IbDataSourceCapability): boolean {
    const source = this.activeDataSource();
    return 'capabilities' in source
      ? source.capabilities.has(capability)
      : !this.isRemoteDataSource(source);
  }

  private isExportSettings(settings: Partial<IDataExportSettings>): settings is IDataExportSettings {
    return settings.format !== undefined
      && (settings.dataset === 'all'
        || settings.dataset === 'selected'
        || settings.dataset === 'current');
  }

  private refreshCurrentPageExportAvailability(): void {
    const paginator = this.paginator();
    this.currentPageExportAvailable.set(!!paginator && paginator.getNumberOfPages() > 1);
  }

  private canExportDataset(dataset: IDataExportSettings['dataset']): boolean {
    if (dataset === 'all') return this.canExportAllRows();
    if (dataset === 'selected') return this.canSelectRows();
    return this.canExportCurrentPage();
  }

  private createExportableSource(
    source: IbTableSource,
    dataset: IDataExportSettings['dataset'],
  ): IbExportableSource {
    return {
      filteredData: this.exportRows(source, dataset),
      sort: null,
      sortData: (data) => data,
      paginator: null,
      sortedColumns: this.exportColumns(),
      capabilities: this.exportCapabilities(source),
    };
  }

  private exportRows(
    source: IbTableSource,
    dataset: IDataExportSettings['dataset'],
  ): unknown[] {
    const orderedRows = this.orderedExportRows(source);

    if (dataset === 'selected') {
      const selectedRows = this.selectionColumn()?.selection.selected ?? [];
      return orderedRows.filter((row) => selectedRows.includes(row));
    }

    if (this.isRemoteDataSource(source)) return orderedRows;

    if (dataset !== 'current') return orderedRows;

    return source.getCurrentPageData();
  }

  private orderedExportRows(source: IbTableSource): unknown[] {
    if (this.isRemoteDataSource(source)) return [...source.filteredData];
    return source.getOrderedData();
  }

  private exportColumns(): IbColumn<unknown>[] {
    return [...this.columns()];
  }

  private exportCapabilities(source: IbTableSource): ReadonlySet<IbDataSourceCapability> {
    return source.capabilities;
  }
}
