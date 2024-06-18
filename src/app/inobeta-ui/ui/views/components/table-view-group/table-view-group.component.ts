import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChildren,
  inject,
} from "@angular/core";
import { Store } from "@ngrx/store";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { takeUntil, tap } from "rxjs/operators";
import { IbKaiTableAction } from "../../../kai-table/action";
import { ITableViewData, IView, selectTableViews } from "../../store/views";
import { IbViewService } from "../../view.service";
import { IbTableUrlService } from "../../../kai-table/table-url.service";

@Component({
  selector: "ib-view-group, ib-table-view-group",
  templateUrl: "table-view-group.component.html",
  styleUrls: ["table-view-group.component.scss"],
})
export class IbTableViewGroup implements OnDestroy  {
  @ViewChildren(IbKaiTableAction) actions: QueryList<IbKaiTableAction>;

  private _destroyed = new Subject<void>();
  tableUrl = inject(IbTableUrlService);

  get defaultView(): IView{
    return {
      id: "__ibTableView__all",
      name: "",
      groupName: "",
      data: {
        filter: this.tableUrl.emptyFilterSchema[this.viewGroupName],
        pageSize: 10,
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


  @Input() viewDataAccessor: () => ITableViewData = () => structuredClone(this.defaultView.data);

  @Output() ibViewChanged = new EventEmitter<IView>();
  @Output() ibResetView = new EventEmitter();

  @Input() set viewGroupName(name) {
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

  dirty = false;
  views$: Observable<IView[]>;

  constructor(private store: Store, public viewService: IbViewService) {}


  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }


  checkViewDataChanges(): boolean {
    const current = this.viewDataAccessor();
    if (current === undefined) {
      return false;
    }

    // FIXME: this check is really bad, we should use a deep comparison and schema initializer must be done in a better way
    if(JSON.stringify(this.activeView.data.filter) == '{}'){
      this.activeView.data.filter = structuredClone(this.tableUrl.emptyFilterSchema[this.viewGroupName])
    }


    return JSON.stringify(current) != JSON.stringify(this.activeView.data);
  }

  handleStateChanges(changes$: Observable<unknown>) {
    changes$
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => (this.dirty = this.checkViewDataChanges()));
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
        data: this.viewDataAccessor(),
      });
      this._activeView.next(nextView);
    });
  }

  handleSaveView() {
    if (this.activeView.id === this.defaultView.id) {
      this.handleAddView(this.viewDataAccessor());
      return;
    }

    const view = this.viewService.saveView(
      this.activeView,
      this.viewDataAccessor()
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
            data: this.viewDataAccessor(),
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
          this.viewService.saveView(this.activeView, this.viewDataAccessor());
        }
        this._activeView.next(view);
      });
  }

  handleDiscardChanges() {
    this._activeView.next(this.activeView);
  }
}
