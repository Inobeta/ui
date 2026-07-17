import { Portal } from "@angular/cdk/portal";
import { Observable, Subject } from "rxjs";
import { IbTableViewsData, IbTableViewsHost } from "./table-views-host";

export class IbTableViewsHostStub extends IbTableViewsHost {
  viewGroupName = "";
  viewDataAccessor: () => IbTableViewsData = () => ({} as IbTableViewsData);
  private _activeViewChanged = new Subject<
    IbTableViewsData & { viewId: string }
  >();
  readonly activeViewChanged = this._activeViewChanged.asObservable();
  toolbarPortals: Portal<any>[] = [];
  dirty = false;

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

  /** Helper to simulate a view change from tests. */
  emitActiveViewChanged(data: IbTableViewsData & { viewId: string }): void {
    this._activeViewChanged.next(data);
  }
}
