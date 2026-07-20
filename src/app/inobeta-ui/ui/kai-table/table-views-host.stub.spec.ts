import { Portal } from "@angular/cdk/portal";
import { Observable, Subject, of } from "rxjs";
import { IbTableViewsData, IbTableViewsHost } from "./table-views-host";

export class IbTableViewsHostStub extends IbTableViewsHost {
  viewGroupName = "";
  viewDataAccessor: () => IbTableViewsData = () => ({} as IbTableViewsData);
  private _activeViewChanged = new Subject<
    IbTableViewsData & { viewId: string | null }
  >();
  readonly activeViewChanged = this._activeViewChanged.asObservable();
  toolbarPortals: Portal<any>[] = [];
  dirty = false;

  /** Internal map of view snapshots used by the stub's resolveView. */
  private _views = new Map<string, IbTableViewsData>();

  setViewGroupName(name: string): void {
    this.viewGroupName = name;
  }

  setViewDataAccessor(fn: () => IbTableViewsData): void {
    this.viewDataAccessor = fn;
  }

  handleStateChanges(changes$: Observable<unknown>): void {
    changes$.subscribe(() => {
      this.dirty = true;
    });
  }

  /**
   * Resolves a view snapshot by ID using the stub's internal map.
   *
   * Returns `null` when `viewId` is `null`, `"__ibTableView__all"`,
   * unknown, or the map contains no entry for the given ID.
   */
  resolveView(viewId: string | null): Observable<IbTableViewsData | null> {
    if (!viewId || viewId === "__ibTableView__all") {
      return of(null);
    }
    return of(this._views.get(viewId) ?? null);
  }

  /** Register a view snapshot so resolveView can return it. */
  registerView(viewId: string, data: IbTableViewsData): void {
    this._views.set(viewId, data);
  }

  /** Helper to simulate a view change from tests. */
  emitActiveViewChanged(data: IbTableViewsData & { viewId: string | null }): void {
    this._activeViewChanged.next(data);
  }
}
