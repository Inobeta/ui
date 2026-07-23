import { Portal, TemplatePortal } from "@angular/cdk/portal";
import {
  Component,
  OnDestroy,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import { filter, map, takeUntil } from "rxjs/operators";
import { Sort, SortDirection } from "@angular/material/sort";
import { IbKaiTableAction } from "../../../kai-table/action";
import {
  IbTableViewsData,
  IbTableViewsHost,
} from "../../../kai-table/table-views-host";
import { IbTableFilterState } from "../../../kai-table/table.types";
import { IView } from "../../view.types";
import { IbViewService } from "../../view.service";
import { IbViewDialogResult } from "../../view.types";

/** Sentinel ID for the implicit Default (all-data) view. */
const DEFAULT_SENTINEL = '__ibTableView__all';

/**
 * Sorts whose `active` and `direction` are both empty represent
 * "no sort". Normalising them to `null` keeps comparisons clean.
 */
const EMPTY_SORT: Sort = { active: '', direction: '' as SortDirection };

@Component({
  selector: "ib-view-group, ib-table-view-group",
  templateUrl: "table-view-group.component.html",
  styleUrls: ["table-view-group.component.scss"],
  standalone: false
})
export class IbTableViewGroup extends IbTableViewsHost implements OnDestroy {
  @ViewChildren(IbKaiTableAction) actions: QueryList<IbKaiTableAction>;

  private _destroyed = new Subject<void>();

  // ---------------------------------------------------------------------------
  // Default baseline (received from Kai Table via Step 1 hook)
  // ---------------------------------------------------------------------------

  private _defaultBaseline: IbTableViewsData | null = null;

  /**
   * Stores the table-def-derived Default snapshot for dirty comparison
   * and as the fallback active view data.
   */
  override setDefaultViewBaseline(data: IbTableViewsData): void {
    this._defaultBaseline = data;
    // Update the initial defaultView so its data reflects the real baseline
    if (this._activeView.value.id === DEFAULT_SENTINEL) {
      this._activeView.next({
        ...this._activeView.value,
        data: { ...data },
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Default view object (derived from baseline once it arrives)
  // ---------------------------------------------------------------------------

  get defaultView(): IView {
    return {
      id: DEFAULT_SENTINEL,
      name: '',
      groupName: this._viewGroupName ?? '',
      data: this._defaultBaseline
        ? { ...this._defaultBaseline }
        : {
            filter: {} as IView['data']['filter'],
            filters: null,
            pageSize: 20,
            aggregatedColumns: {},
            sort: { ...EMPTY_SORT },
          },
    };
  }

  // ---------------------------------------------------------------------------
  // Active view state
  // ---------------------------------------------------------------------------

  /**
   * The currently highlighted view.
   *
   * `initial: true` marks emissions that should NOT produce a table
   * selection intent (used for canonical sync, save, rename, reorder).
   */
  _activeView = new BehaviorSubject<IView>({
    ...this.defaultView,
    initial: true,
  });

  get activeView(): IView {
    return {
      ...this._activeView.value,
      initial: false,
    };
  }

  // ---------------------------------------------------------------------------
  // Data accessor (set by the table)
  // ---------------------------------------------------------------------------

  private _viewDataAccessor: () => IbTableViewsData = () =>
    structuredClone(this.defaultView.data);

  override setViewDataAccessor(fn: () => IbTableViewsData): void {
    this._viewDataAccessor = fn;
  }

  // ---------------------------------------------------------------------------
  // Group name & views loading (no Store, no UrlService)
  // ---------------------------------------------------------------------------

  private _viewGroupName: string | undefined;

  override setViewGroupName(name: string): void {
    this._viewGroupName = name;
    this.views$ = this.viewService.viewsForGroup(name);
  }

  get viewGroupName(): string {
    return this._viewGroupName ?? '';
  }

  views$!: Observable<IView[]>;

  // ---------------------------------------------------------------------------
  // Canonical sync (called by the table on init, reload, back/forward)
  // ---------------------------------------------------------------------------

  override syncActiveView(viewId: string | null): void {
    if (!viewId) {
      // Default selected
      this._activeView.next({ ...this.defaultView, initial: true });
      this._dirty = false;
      return;
    }

    // Look up the view in the current in-memory list
    const resolved = this.viewService.resolveView(this.viewGroupName, viewId);
    if (resolved) {
      this._activeView.next({ ...resolved, initial: true });
      this._dirty = false;
    } else {
      // Unknown view → fall back to Default
      this._activeView.next({ ...this.defaultView, initial: true });
      this._dirty = false;
    }
  }

  // ---------------------------------------------------------------------------
  // View resolution (host contract)
  // ---------------------------------------------------------------------------

  override resolveView(
    viewId: string | null
  ): Observable<IbTableViewsData | null> {
    if (!viewId || viewId === DEFAULT_SENTINEL) {
      return of(null);
    }
    const view = this.viewService.resolveView(this.viewGroupName, viewId);
    return of(view ? this._viewDataToHostData(view.data) : null);
  }

  // ---------------------------------------------------------------------------
  // Toolbar portals
  // ---------------------------------------------------------------------------

  override get toolbarPortals(): Portal<any>[] {
    return (
      this.actions?.toArray().map(
        (action) =>
          new TemplatePortal(action.templateRef(), action.viewContainerRef)
      ) ?? []
    );
  }

  // ---------------------------------------------------------------------------
  // Active-view changed (user intent only — filtered by `initial`)
  // ---------------------------------------------------------------------------

  override get activeViewChanged(): Observable<
    IbTableViewsData & { viewId: string | null }
  > {
    return this._activeView.pipe(
      filter((v) => !!v && !v.initial),
      map((v) => ({
        filter: v.data.filter,
        filters: v.data.filters ?? null,
        pageSize: v.data.pageSize,
        aggregatedColumns: v.data.aggregatedColumns,
        sort: v.data.sort,
        viewId: v.id === DEFAULT_SENTINEL ? null : v.id,
      }))
    );
  }

  // ---------------------------------------------------------------------------
  // Dirty tracking
  // ---------------------------------------------------------------------------

  private _dirty = false;

  override get dirty(): boolean {
    return this._dirty;
  }

  override handleStateChanges(changes$: Observable<unknown>): void {
    changes$
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => (this._dirty = this.checkViewDataChanges()));
  }

  /**
   * Compares the current table state (from the accessor) with the active
   * view's saved snapshot using only the four canonical persistable fields.
   *
   * For the Default view the saved snapshot is the baseline received via
   * {@link setDefaultViewBaseline}. For named views it is the view's own
   * stored {@link IView.data}.
   */
  checkViewDataChanges(): boolean {
    const current = this._viewDataAccessor();
    if (!current) {
      return false;
    }

    const activeVal = this._activeView.value;

    // Determine the "saved" snapshot to compare against
    let saved: Pick<IbTableViewsData, 'filters' | 'sort' | 'pageSize' | 'aggregatedColumns'>;
    if (activeVal.id === DEFAULT_SENTINEL) {
      saved = this._defaultBaseline ?? {
        filters: null,
        sort: { ...EMPTY_SORT },
        pageSize: 20,
        aggregatedColumns: {},
      };
    } else {
      saved = {
        filters: activeVal.data.filters ?? null,
        sort: activeVal.data.sort,
        pageSize: activeVal.data.pageSize,
        aggregatedColumns: activeVal.data.aggregatedColumns,
      };
    }

    // Compare only canonical fields, order-insensitive
    return !(
      IbTableViewGroup._deepEqualFilters(
        current.filters ?? null,
        saved.filters ?? null
      ) &&
      IbTableViewGroup._normalizeSort(current.sort).active ===
        IbTableViewGroup._normalizeSort(saved.sort).active &&
      IbTableViewGroup._normalizeSort(current.sort).direction ===
        IbTableViewGroup._normalizeSort(saved.sort).direction &&
      current.pageSize === saved.pageSize &&
      IbTableViewGroup._deepEqualObj(
        current.aggregatedColumns,
        saved.aggregatedColumns
      )
    );
  }

  // ---------------------------------------------------------------------------
  // Handlers: CRUD & selection
  // ---------------------------------------------------------------------------

  /**
   * Creates a new view from the current table state.
   *
   * The `data` parameter allows callers to override the snapshot (e.g.
   * `handleSaveView` for the Default tab passes the current accessor state
   * explicitly).
   */
  handleAddView(data?: IView['data']): void {
    const snapshot = data ?? this.defaultView.data;
    this.viewService.openAddViewDialog().subscribe(({ name }) => {
      const view = this.viewService.addView({
        name,
        groupName: this.viewGroupName,
        data: snapshot,
      });
      // Select the new view (user intent)
      this._activeView.next(view);
    });
  }

  /** Deletes a view. Only applies Default when the deleted view is active. */
  handleRemoveView(view: IView): void {
    if (view.id === DEFAULT_SENTINEL) {
      return;
    }

    this.viewService.openDeleteViewDialog(view).subscribe(() => {
      const wasActive = this._activeView.value.id === view.id;
      this.viewService.deleteView(view);

      if (wasActive) {
        // Apply Default (emits user intent)
        this._activeView.next(this.defaultView);
      }
    });
  }

  /** Renames a view in place without applying it. */
  handleRenameView(view: IView): void {
    if (view.id === DEFAULT_SENTINEL) {
      return;
    }

    this.viewService.openRenameViewDialog(view).subscribe(({ name }) => {
      const renamed = this.viewService.renameView(view, name);
      // Update local state without emitting a table intent
      if (this._activeView.value.id === view.id) {
        this._activeView.next({ ...renamed, initial: true });
      }
    });
  }

  /** Duplicates a view using the current table state. */
  handleDuplicateView(view: IView): void {
    if (view.id === DEFAULT_SENTINEL) {
      return;
    }

    this.viewService.openDuplicateViewDialog(view).subscribe(({ name }) => {
      const nextView = this.viewService.duplicateView({
        name,
        groupName: view.groupName,
        data: this._viewDataAccessor(),
      });
      // Select the new duplicate (user intent)
      this._activeView.next(nextView);
    });
  }

  /**
   * Saves the current table state into the active view.
   *
   * - Default → delegates to {@link handleAddView} (create new named view).
   * - Named view → updates in place **without** emitting `activeViewChanged`.
   */
  handleSaveView(): void {
    if (this._activeView.value.id === DEFAULT_SENTINEL) {
      this.handleAddView(this._viewDataAccessor());
      return;
    }

    const view = this.viewService.saveView(
      this.activeView,
      this._viewDataAccessor()
    );
    // Update local state without emitting a table intent
    this._activeView.next({ ...view, initial: true });
    this._dirty = false;
  }

  /**
   * Handles tab/wiew selection, including the dirty-switch workflow.
   *
   * Clean switch → immediate selection.
   * Dirty switch → three-outcome Save / Discard / Cancel dialog.
   */
  handleChangeView(targetView: IView): void {
    if (!this._dirty) {
      this._activeView.next(targetView);
      return;
    }

    if (this._activeView.value.id === DEFAULT_SENTINEL) {
      // Dirty Default → Save (chains name dialog) / Discard / Cancel
      const dialogRef = this.viewService.openDialog({
        title: 'shared.ibTableView.unsavedTitle',
        confirm: 'shared.ibTableView.save',
        discardLabel: 'shared.ibTableView.discard',
        message: {
          label: 'shared.ibTableView.unsavedUnnamedView',
        },
        hideInput: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (!result) {
          // Cancel — stay on Default
          return;
        }

        if (result.action === IbViewDialogResult.Save) {
          // Open name dialog; if cancelled, stay on Default
          this.viewService.openAddViewDialog().subscribe({
            next: ({ name }) => {
              this.viewService.addView({
                name,
                groupName: this.viewGroupName,
                data: this._viewDataAccessor(),
              });
              this._activeView.next(targetView);
            },
            // Dialog cancelled → stay on Default (no-op)
          });
          return;
        }

        if (result.action === IbViewDialogResult.Discard) {
          this._activeView.next(targetView);
        }
        // Cancel already handled above
      });
      return;
    }

    // Dirty named view → Save / Discard / Cancel
    const dialogRef = this.viewService.openDialog({
      title: 'shared.ibTableView.unsavedTitle',
      confirm: 'shared.ibTableView.save',
      discardLabel: 'shared.ibTableView.discard',
      message: {
        label: 'shared.ibTableView.unsavedView',
        args: { viewName: this._activeView.value.name },
      },
      hideInput: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        // Cancel — stay on current view
        return;
      }

      if (result.action === IbViewDialogResult.Save) {
        this.viewService.saveView(
          this.activeView,
          this._viewDataAccessor()
        );
      }

      if (result.action !== IbViewDialogResult.Cancel) {
        this._activeView.next(targetView);
      }
    });
  }

  /** Resets the dirty state by re-synchronising with the current saved view. */
  handleDiscardChanges(): void {
    const current = this._activeView.value;
    this._activeView.next({ ...current, initial: true });
    this._dirty = false;
  }

  /** Persists a new view order after drag-and-drop reorder. */
  handleReorderViews(views: IView[]): void {
    this.viewService.reorderViews(this.viewGroupName, views);
  }

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  constructor(public viewService: IbViewService) {
    super();
  }

  ngOnDestroy(): void {
    this._destroyed.next();
    this._destroyed.complete();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Marshals internal IView.data to the host boundary format. */
  private _viewDataToHostData(data: IView['data']): IbTableViewsData {
    return {
      filter: data.filter,
      filters: data.filters ?? null,
      pageSize: data.pageSize,
      aggregatedColumns: data.aggregatedColumns,
      sort: data.sort,
    };
  }

  // ---------------------------------------------------------------------------
  // Static comparison helpers
  // ---------------------------------------------------------------------------

  /** Normalises an empty sort to `{active:'',direction:''}`. */
  private static _normalizeSort(
    s: { active?: string; direction?: string } | null | undefined
  ): Sort {
    if (!s || (!s.active && !s.direction)) {
      return { active: '', direction: '' as SortDirection };
    }
    return {
      active: s.active ?? '',
      direction: (s.direction as SortDirection) ?? '' as SortDirection,
    };
  }

  /**
   * Order-insensitive deep equality for filter state objects.
   *
   * Compares two `IbTableFilterState` values (which may be plain
   * objects, arrays, or primitives) recursively without relying on
   * key order.
   */
  private static _deepEqualFilters(
    a: IbTableFilterState | null,
    b: IbTableFilterState | null
  ): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a !== 'object') return a === b;

    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, i) =>
        IbTableViewGroup._deepEqualFilters(
          item as IbTableFilterState,
          b[i] as IbTableFilterState
        )
      );
    }

    if (Array.isArray(a) || Array.isArray(b)) return false;

    const keysA = Object.keys(a as Record<string, unknown>).sort();
    const keysB = Object.keys(b as Record<string, unknown>).sort();

    if (keysA.length !== keysB.length) return false;
    if (!keysA.every((k, i) => k === keysB[i])) return false;

    return keysA.every((k) =>
      IbTableViewGroup._deepEqualFilters(
        (a as Record<string, unknown>)[k] as IbTableFilterState,
        (b as Record<string, unknown>)[k] as IbTableFilterState
      )
    );
  }

  /** Order-insensitive deep equality for plain record objects. */
  private static _deepEqualObj(
    a: Record<string, string>,
    b: Record<string, string>
  ): boolean {
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k, i) => k === keysB[i] && a[k] === b[k]);
  }
}
