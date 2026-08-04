import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Sort } from '@angular/material/sort';
import {
  Observable,
  Subject,
  firstValueFrom,
  map,
  distinctUntilChanged,
  filter,
  takeUntil,
} from 'rxjs';
import {
  tableStateActions,
} from './store/url-state/actions';
import {
  selectIbKaiTableSnapshot,
} from './store';
import { IbTableUrlService } from './table-url.service';
import { resolveInitialTableState } from './table-state-resolver';
import { decodeUrlPayload, encodeUrlPayload } from './table-url-codec';
import { IbFilterSyntaxExtended } from '../kai-filter/filter.types';
import { IbTableViewsHost, IbTableViewsData } from './table-views-host';
import {
  IbKaiTableSnapshot,
  IbKaiTableViewSnapshot,
  IbTableFilterState,
  IbTableDef,
} from './table.types';

// ---------------------------------------------------------------------------
// Technical defaults — copied here to avoid importing the resolver internals
// and to initialize the default signal value before the store connects.
// ---------------------------------------------------------------------------

const TECHNICAL_DEFAULTS: IbKaiTableSnapshot = Object.freeze({
  sort: null,
  filters: null,
  selectedView: null,
  pageIndex: 0,
  pageSize: 20,
  aggregatedColumns: Object.freeze({}),
});

// ---------------------------------------------------------------------------
// Facade class
// ---------------------------------------------------------------------------

/**
 * Per-table facade that orchestrates NgRx store initialization, URL
 * hydration, and browser back/forward re-synchronization for a single
 * {@link IbKaiTableComponent} instance.
 *
 * ## Lifecycle
 *
 * 1. The owning table component calls {@link initialize} once during its
 *    first content-init phase, passing `tableName`, `tableDef`, and an
 *    optional {@link IbTableViewsHost}.
 * 2. The facade decodes the URL, resolves any requested views, merges
 *    all layers via {@link resolveInitialTableState}, and dispatches a
 *    single `Initialize` action to the store.
 * 3. After initialization the facade subscribes to
 *    `ActivatedRoute.queryParams` for browser back/forward navigation.
 * 4. User-driven state changes flow through the facade's intent methods
 *    ({@link setSort}, {@link setFilters}, {@link setPaginator},
 *    {@link setAggregatedColumns}, {@link applyView}) which dispatch
 *    canonical {@link tableStateActions} that reset `pageIndex`
 *    atomically on filter/sort/view changes.
 * 5. On destroy the facade closes its subscriptions but intentionally
 *    leaves the NgRx record intact — state is preserved for re-mounts.
 *
 * ## Provider scope
 *
 * This facade carries per-table identity (`tableName`) and therefore
 * **must NOT** be registered as `providedIn: 'root'`.  It should be
 * provided at the component level (e.g. in `IbTable.providers`) so
 * every table instance receives its own copy.
 *
 * @remarks The facade does **not** import `MatSort`, `MatPaginator`,
 * `MatTable`, or any data-source class.  It talks exclusively to the
 * NgRx store, the Angular router, and the table-state resolver.
 */
@Injectable()
export class IbKaiTableStateFacade {
  // -----------------------------------------------------------------------
  // Injected dependencies
  // -----------------------------------------------------------------------

  private readonly store = inject(Store);
  private readonly urlService = inject(IbTableUrlService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  // -----------------------------------------------------------------------
  // Per-table identity
  // -----------------------------------------------------------------------

  private _tableName: string | null = null;

  /** The table name assigned during {@link initialize}. */
  get tableName(): string | null {
    return this._tableName;
  }

  private _tableDef: IbTableDef | null = null;
  private _viewsHost: IbTableViewsHost | null = null;
  private _initialized = false;
  private readonly _destroy$ = new Subject<void>();

  // -----------------------------------------------------------------------
  // Signals — exposed as read-only views over the canonical NgRx state
  // -----------------------------------------------------------------------

  private readonly _snapshot = signal<IbKaiTableSnapshot>({
    ...TECHNICAL_DEFAULTS,
    aggregatedColumns: {},
  });

  /** Full canonical snapshot read from the NgRx store. */
  readonly snapshot = this._snapshot.asReadonly();

  /** Current sort state (`null` when no column is sorted). */
  readonly sort = computed<Sort | null>(() => this._snapshot().sort);

  /** Current raw filter form values (`null` when no filter is applied). */
  readonly filters = computed<IbTableFilterState | null>(
    () => this._snapshot().filters,
  );

  /** Zero-based active page index. */
  readonly pageIndex = computed<number>(() => this._snapshot().pageIndex);

  /** Rows displayed per page. */
  readonly pageSize = computed<number>(() => this._snapshot().pageSize);

  /**
   * ID of the active view, or `null` when the implicit "all data" view
   * is selected.
   */
  readonly selectedView = computed<string | null>(
    () => this._snapshot().selectedView,
  );

  /** Active column aggregation map (column name → aggregate function key). */
  readonly aggregatedColumns = computed<Record<string, string>>(
    () => this._snapshot().aggregatedColumns,
  );

  /** `true` after {@link initialize} has completed the first dispatch. */
  readonly initialized = computed<boolean>(() => this._initialized);

  // -----------------------------------------------------------------------
  // Initialization
  // -----------------------------------------------------------------------

  /**
   * Initializes the table state for the given `tableName` by layering
   * `tableDef` defaults, optional view snapshots, and URL overrides
   * through the canonical resolver, then dispatching a single
   * {@link tableStateActions.initialize} action.
   *
   * This method is idempotent: calls after the first complete init are
   * ignored unless `tableName` changed (which triggers a warning).
   *
   * @param tableName   Unique key for this table (used as NgRx record ID
   *                    and query-param key).
   * @param tableDef    Static configuration with `initial*` defaults.
   * @param viewsHost   Optional views provider — when present the facade
   *                    will resolve `initialView` and URL `view` references
   *                    before calling the resolver.
   * @returns A Promise that resolves when the `Initialize` action has been
   *          dispatched.  Consumers should await this before connecting
   *          data sources or binding Material components.
   */
  async initialize(
    tableName: string,
    tableDef: IbTableDef,
    viewsHost?: IbTableViewsHost,
  ): Promise<void> {
    // --- Guard: reject tableName change after init ---
    if (this._initialized) {
      if (this._tableName !== tableName) {
        console.warn(
          `[IbKaiTableStateFacade] Cannot change tableName from ` +
            `"${this._tableName}" to "${tableName}" after initialization.`,
        );
      }
      return;
    }

    this._tableName = tableName;
    this._tableDef = tableDef;
    this._viewsHost = viewsHost ?? null;

    // --- Layer 1: decode raw URL params synchronously ---
    const urlParams = this.urlService.decodeUrlParams(tableName);

    // --- Resolve all view layers and merge them through the canonical resolver ---
    const snapshot = await this.resolveUrlState(urlParams);

    // --- Single dispatch ---
    this.store.dispatch(
      tableStateActions.initialize({ tableName, snapshot }),
    );
    this._initialized = true;

    // --- Connect store → signals ---
    this.connectStoreSignals();

    // --- Observe URL for back/forward ---
    this.startUrlObservation();
  }

  // -----------------------------------------------------------------------
  // Default view baseline
  // -----------------------------------------------------------------------

  /**
   * Derives a Default view baseline from the table definition and technical
   * defaults, without consulting the URL, `initialView`, or `initialPageIndex`.
   *
   * This snapshot represents the baseline "all data" state of the table
   * **before** any view is applied.  The views host uses it to detect
   * dirty state on the implicit Default tab and as a fallback when no
   * named view is selected.
   *
   * `selectedView` is always `null` in the returned data.
   *
   * ## Field precedence (lowest to highest)
   *
   * 1. Technical defaults — `sort: null`, `filters: null`, `pageSize: 20`,
   *    `aggregatedColumns: {}`.
   * 2. `tableDef.initial*` — `initialSort`, `initialFilters`,
   *    `initialPageSize`, `initialAggregatedColumns` (only when the key
   *    is **present** in `tableDef`; `null` means "clear to default").
   *
   * `initialView` and `initialPageIndex` are intentionally excluded to
   * provide a stable, view-less baseline.
   */
  getDefaultViewBaseline(): IbTableViewsData {
    const def = this._tableDef;

    const sort: Sort | null =
      def && Object.prototype.hasOwnProperty.call(def, 'initialSort')
        ? def.initialSort!
        : null;

    const filters: IbTableFilterState | null =
      def && Object.prototype.hasOwnProperty.call(def, 'initialFilters')
        ? def.initialFilters!
        : null;

    const pageSize: number =
      def && Object.prototype.hasOwnProperty.call(def, 'initialPageSize')
        ? def.initialPageSize! ?? TECHNICAL_DEFAULTS.pageSize
        : TECHNICAL_DEFAULTS.pageSize;

    const aggregatedColumns: Record<string, string> =
      def && Object.prototype.hasOwnProperty.call(def, 'initialAggregatedColumns')
        ? def.initialAggregatedColumns! ?? {}
        : { ...TECHNICAL_DEFAULTS.aggregatedColumns };

    return {
      filter: {} as IbFilterSyntaxExtended,
      filters: filters ?? null,
      pageSize,
      aggregatedColumns,
      sort: sort ?? { active: '', direction: '' },
    };
  }

  // -----------------------------------------------------------------------
  // Intent methods — dispatch canonical actions that reset page when needed
  // -----------------------------------------------------------------------

  /**
   * Update the active sort.
   *
   * The reducer atomically resets `pageIndex` to 0.
   */
  setSort(sort: Sort | null): void {
    this.assertInitialized();
    this.store.dispatch(
      tableStateActions.setSort({ tableName: this._tableName!, sort }),
    );
  }

  /**
   * Update the raw filter form values.
   *
   * The reducer atomically resets `pageIndex` to 0.
   */
  setFilters(filters: IbTableFilterState | null): void {
    this.assertInitialized();
    this.store.dispatch(
      tableStateActions.setFilters({ tableName: this._tableName!, filters }),
    );
  }

  /** Update the paginator state (page index and/or page size). */
  setPaginator(pageIndex: number, pageSize: number): void {
    this.assertInitialized();
    this.store.dispatch(
      tableStateActions.setPaginator({
        tableName: this._tableName!,
        pageIndex,
        pageSize,
      }),
    );
  }

  /** Update the column aggregation map. */
  setAggregatedColumns(aggregatedColumns: Record<string, string>): void {
    this.assertInitialized();
    this.store.dispatch(
      tableStateActions.setAggregatedColumns({
        tableName: this._tableName!,
        aggregatedColumns,
      }),
    );
  }

  /**
   * Apply a view snapshot.
   *
   * The reducer atomically sets `selectedView`, applies the snapshot
   * (sort, filters, pageSize, aggregatedColumns), and resets `pageIndex`
   * to 0.
   */
  applyView(selectedView: string | null, snapshot: IbKaiTableViewSnapshot): void {
    this.assertInitialized();
    this.store.dispatch(
      tableStateActions.applyView({
        tableName: this._tableName!,
        selectedView,
        snapshot,
      }),
    );
  }

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  /**
   * Tears down subscriptions and URL observation.
   *
   * **Does not** remove the NgRx record — state is intentionally preserved
   * for possible re-mounts or cross-component access.
   */
  destroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // -----------------------------------------------------------------------
  // Private helpers
  // -----------------------------------------------------------------------

  /** Resolves a view ID through the views host and converts it to a snapshot. */
  private async resolveViewSnapshot(
    viewId: string | null,
  ): Promise<IbKaiTableViewSnapshot | null> {
    if (!this._viewsHost) return null;

    const data = await firstValueFrom(
      this._viewsHost.resolveView(viewId),
    );

    return data ? this.viewsDataToSnapshot(data) : null;
  }

  /** Converts `IbTableViewsData` into the canonical `IbKaiTableViewSnapshot` format. */
  private viewsDataToSnapshot(data: IbTableViewsData): IbKaiTableViewSnapshot {
    // Prefer the canonical `filters` (including an intentional null) over the legacy `filter`.
    const filters: IbTableFilterState | null =
      data.filters !== undefined
        ? data.filters
        : (data.filter as IbTableFilterState);

    return {
      sort: data.sort?.active ? data.sort : null,
      filters: filters ?? null,
      pageSize: data.pageSize,
      aggregatedColumns: data.aggregatedColumns,
    };
  }

  /** Opens the one-way store → signals subscription. */
  private connectStoreSignals(): void {
    this.store
      .select(selectIbKaiTableSnapshot(this._tableName!))
      .pipe(takeUntil(this._destroy$))
      .subscribe((storeSnapshot) => {
        if (storeSnapshot) {
          this._snapshot.set(storeSnapshot);
        }
      });
  }

  /** Subscribes to URL changes to handle browser back/forward navigation. */
  private startUrlObservation(): void {
    this.activatedRoute.queryParams
      .pipe(
        map((params) => params[this._tableName!] as string | undefined),
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      )
      .subscribe((raw) => {
        this.handleUrlChange(raw);
      });
  }

  /**
   * Processes a raw query-param value change.
   *
   * - Malformed JSON → write current canonical state to normalize the URL.
   * - Value matches current store state → ignore (own navigation, no loop).
   * - Value differs from current store state → dispatch `hydrateFromUrl`
   *   (browser back/forward or external navigation).
   */
  private handleUrlChange(raw: string | undefined): void {
    if (raw === undefined) {
      this.hydrateResolvedUrl(null);
      return;
    }

    const urlParams = decodeUrlPayload(raw);

    // Malformed JSON or invalid schema → normalize the URL
    if (!urlParams) {
      this.normalizeMalformedUrl();
      return;
    }

    // Compare URL patch with current store values to avoid a loop when
    // the effect's `writeState` changes the query string.
    const storeSnapshot = this._snapshot();
    if (!this.isUrlStateDifferent(urlParams, storeSnapshot)) {
      return; // own navigation — URL already reflects store state
    }

    // External change → hydrate from URL
    this.hydrateResolvedUrl(urlParams);
  }

  private hydrateResolvedUrl(
    urlParams: import('./table.types').IbKaiTableUrlParams | null,
  ): void {
    if (!this._viewsHost) {
      this.store.dispatch(tableStateActions.hydrateFromUrl({
        tableName: this._tableName!,
        snapshot: resolveInitialTableState({ tableDef: this._tableDef, urlParams }),
      }));
      return;
    }
    void this.resolveUrlState(urlParams).then((snapshot) => {
      this.store.dispatch(tableStateActions.hydrateFromUrl({
        tableName: this._tableName!,
        snapshot,
      }));
    });
  }

  private async resolveUrlState(
    urlParams: import('./table.types').IbKaiTableUrlParams | null,
  ): Promise<IbKaiTableSnapshot> {
    let initialViewSnapshot: IbKaiTableViewSnapshot | null = null;
    let urlViewSnapshot: IbKaiTableViewSnapshot | null = null;
    let resolvedUrlParams = urlParams;
    const tableDef = this._tableDef;

    const hasUrlView = !!urlParams && Object.prototype.hasOwnProperty.call(urlParams, 'view');
    if (this._viewsHost && !hasUrlView && tableDef && Object.prototype.hasOwnProperty.call(tableDef, 'initialView')) {
      initialViewSnapshot = await this.resolveViewSnapshot(tableDef.initialView!);
    }
    if (this._viewsHost && hasUrlView && urlParams!.view !== null) {
      urlViewSnapshot = await this.resolveViewSnapshot(urlParams.view!);
      if (!urlViewSnapshot) {
        resolvedUrlParams = { ...urlParams!, view: null };
      }
    }

    return resolveInitialTableState({
      tableDef,
      urlParams: resolvedUrlParams,
      initialViewSnapshot,
      urlViewSnapshot,
    });
  }

  /**
   * Returns `true` when at least one field that is **present** in
   * `urlParams` has a different value than the corresponding field in
   * `storeSnapshot`.
   */
  private isUrlStateDifferent(
    urlParams: import('./table.types').IbKaiTableUrlParams,
    storeSnapshot: IbKaiTableSnapshot,
  ): boolean {
    if ('sort' in urlParams) {
      if (urlParams.sort?.active !== storeSnapshot.sort?.active) return true;
      if (urlParams.sort?.direction !== storeSnapshot.sort?.direction) return true;
    }
    if ('filters' in urlParams) {
      if (JSON.stringify(urlParams.filters) !== JSON.stringify(storeSnapshot.filters)) {
        return true;
      }
    }
    if ('view' in urlParams) {
      if (urlParams.view !== storeSnapshot.selectedView) return true;
    }
    if ('pageIndex' in urlParams) {
      if ((urlParams.pageIndex ?? 0) !== storeSnapshot.pageIndex) return true;
    }
    if ('pageSize' in urlParams) {
      if ((urlParams.pageSize ?? 20) !== storeSnapshot.pageSize) return true;
    }
    if ('aggregatedColumns' in urlParams) {
      if (
        JSON.stringify(urlParams.aggregatedColumns ?? {}) !==
        JSON.stringify(storeSnapshot.aggregatedColumns)
      ) {
        return true;
      }
    }
    return false;
  }

  /** Writes the current canonical state to the URL to replace malformed params. */
  private normalizeMalformedUrl(): void {
    const current = this._snapshot();
    this.urlService.writeState(this._tableName!, current);
  }

  /** Throws if {@link initialize} was never called. */
  private assertInitialized(): void {
    if (!this._initialized || !this._tableName) {
      throw new Error(
        '[IbKaiTableStateFacade] initialize() must be called before dispatching actions.',
      );
    }
  }
}
