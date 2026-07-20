import { Portal, TemplatePortal } from "@angular/cdk/portal";
import {
  Component,
  OnDestroy,
  QueryList,
  ViewChildren,
  inject,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { BehaviorSubject, Observable, Subject, of } from "rxjs";
import { filter, map, takeUntil, tap } from "rxjs/operators";
import { IbKaiTableAction } from "../../../kai-table/action";
import {
  IbTableViewsData,
  IbTableViewsHost,
} from "../../../kai-table/table-views-host";
import { IView } from "../../store/views";
import { IbViewService } from "../../view.service";
import { IbTableUrlService } from "../../../kai-table/table-url.service";
import { selectTableViews, selectViews } from "../../store/index";

@Component({
  selector: "ib-view-group, ib-table-view-group",
  templateUrl: "table-view-group.component.html",
  styleUrls: ["table-view-group.component.scss"],
  standalone: false
})
export class IbTableViewGroup extends IbTableViewsHost implements OnDestroy {
  @ViewChildren(IbKaiTableAction) actions: QueryList<IbKaiTableAction>;

  private _destroyed = new Subject<void>();
  tableUrl = inject(IbTableUrlService);

  get defaultView(): IView {
    return {
      id: "__ibTableView__all",
      name: "",
      groupName: "",
      data: {
        filter: this.tableUrl.emptyFilterSchema[this.viewGroupName],
        filters: null,
        pageSize: 20,
        aggregatedColumns: {},
        sort: {
          active: "",
          direction: "",
        }
      },
    }
  };

  _activeView = new BehaviorSubject<IView>({
    ...this.defaultView,
    initial: true
  });
  get activeView() {
    return {
      ...this._activeView.value,
      initial: false
    };
  }


  private _viewDataAccessor: () => IbTableViewsData = () =>
    structuredClone(this.defaultView.data);

  override setViewDataAccessor(fn: () => IbTableViewsData): void {
    this._viewDataAccessor = fn;
  }

  override setViewGroupName(name: string) {
    this._viewGroupName = name;
    const activeView = this.tableUrl.getActiveView(name);
    this.views$ = this.store.select(selectTableViews(this._viewGroupName)).pipe(
      tap((views) => {
        if (activeView) {
          let view = views.find((v) => v.id === activeView);
          if (!view) {
            view = this.defaultView;
          }
          this._activeView.next({
            ...view,
            initial: true,
          });
        }
      })
    );
  }
  get viewGroupName() {
    return this._viewGroupName;
  }
  private _viewGroupName: string;

  private _dirty = false;

  override get dirty(): boolean {
    return this._dirty;
  }

  views$: Observable<IView[]>;

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
        viewId: v.id === "__ibTableView__all" ? null : v.id,
      }))
    );
  }

  override get toolbarPortals(): Portal<any>[] {
    return (
      this.actions?.toArray().map(
        (action) =>
          new TemplatePortal(action.templateRef(), action.viewContainerRef)
      ) ?? []
    );
  }

  /**
   * Resolves a view snapshot by its ID.
   *
   * `null` and `'__ibTableView__all'` resolve to `null` (no specific view).
   * Unknown IDs or an empty view store also resolve to `null` without throwing.
   */
  override resolveView(
    viewId: string | null
  ): Observable<IbTableViewsData | null> {
    // The legacy sentinel and explicit null both mean "no view selected"
    if (!viewId || viewId === "__ibTableView__all") {
      return of(null);
    }
    return this.store.select(selectViews).pipe(
      map((views) => views.find((v) => v.id === viewId)),
      map((view) => (view ? this._normalizeViewData(view.data) : null))
    );
  }

  constructor(private store: Store, public viewService: IbViewService) {
    super();
  }


  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }


  checkViewDataChanges(): boolean {
    const current = this._viewDataAccessor();
    if (current === undefined) {
      return false;
    }

    // FIXME: this check is really bad, we should use a deep comparison and schema initializer must be done in a better way
    if (JSON.stringify(this.activeView.data.filter) == '{}') {
      this.activeView.data.filter = structuredClone(this.tableUrl.emptyFilterSchema[this.viewGroupName])
    }

    // Compare only the canonical state fields to avoid noise from the
    // optional `filters` boundary field (which may be absent in the
    // current snapshot produced by the table component's accessor).
    return (
      JSON.stringify(current.filter) !==
        JSON.stringify(this.activeView.data.filter) ||
      current.pageSize !== this.activeView.data.pageSize ||
      JSON.stringify(current.aggregatedColumns) !==
        JSON.stringify(this.activeView.data.aggregatedColumns) ||
      JSON.stringify(current.sort) !==
        JSON.stringify(this.activeView.data.sort)
    );
  }

  override handleStateChanges(changes$: Observable<unknown>) {
    changes$
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => (this._dirty = this.checkViewDataChanges()));
  }

  /**
   * Normalizes the internal `ITableViewData` (which uses the legacy
   * `filter` field typed as `IbFilterSyntaxExtended`) into the canonical
   * {@link IbTableViewsData} boundary used by the kai-table host contract.
   *
   * The legacy `filter` value is copied into both `filter` (for backward
   * compatibility) and `filters` (the canonical raw filter snapshot).
   */
  private _normalizeViewData(data: IView["data"]): IbTableViewsData {
    return {
      filter: data.filter,
      filters: data.filters ?? null,
      pageSize: data.pageSize,
      aggregatedColumns: data.aggregatedColumns,
      sort: data.sort,
    };
  }

  handleAddView(data = this.defaultView.data) {
    this.viewService.openAddViewDialog().subscribe(({ name }) => {
      const view = this.viewService.addView({
        name,
        groupName: this.viewGroupName,
        data,
      });
      this._activeView.next(view);
    });
  }

  handleRemoveView(view: IView) {
    this.viewService.openDeleteViewDialog(view).subscribe(() => {
      this.viewService.deleteView(view);
      this._activeView.next(this.defaultView);
    });
  }

  handleRenameView(view: IView) {
    this.viewService.openRenameViewDialog(view).subscribe(({ name }) => {
      this._activeView.next(this.viewService.renameView(view, name));
    });
  }

  handleDuplicateView(view: IView) {
    this.viewService.openDuplicateViewDialog(view).subscribe(({ name }) => {
      const nextView = this.viewService.duplicateView({
        name,
        groupName: view.groupName,
        data: this._viewDataAccessor(),
      });
      this._activeView.next(nextView);
    });
  }

  handleSaveView() {
    if (this.activeView.id === this.defaultView.id) {
      this.handleAddView(this._viewDataAccessor());
      return;
    }

    const view = this.viewService.saveView(
      this.activeView,
      this._viewDataAccessor()
    );
    this._activeView.next(view);
  }

  handleChangeView(view: IView) {
    if (!this.dirty) {
      this._activeView.next(view);
      return;
    }

    if (this.activeView.id === this.defaultView.id) {
      this.viewService.openSaveAsDialog().subscribe((newView) => {
        if (newView.confirmed) {
          this.viewService.addView({
            name: newView.name,
            groupName: this.viewGroupName,
            data: this._viewDataAccessor(),
          });
        }
        this._activeView.next(view);
      });
      return;
    }

    this.viewService
      .openSaveChangesDialog(this.activeView)
      .subscribe((result) => {
        if (result.confirmed) {
          this.viewService.saveView(this.activeView, this._viewDataAccessor());
        }
        this._activeView.next(view);
      });
  }

  handleDiscardChanges() {
    this._activeView.next(this.activeView);
  }
}
