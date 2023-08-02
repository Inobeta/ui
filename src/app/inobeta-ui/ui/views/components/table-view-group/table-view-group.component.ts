import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { selectPinnedView } from "../../store/pinned-view/selectors";
import { IbView, IView, selectTableViews } from "../../store/views";
import { IbViewService } from "../../view.service";

@Component({
  selector: "ib-view-group, ib-table-view-group",
  templateUrl: "table-view-group.component.html",
  styleUrls: ["table-view-group.component.scss"],
})
export class IbTableViewGroup {
  defaultView: IView = {
    id: "__ibTableView__all",
    name: "",
    groupName: "",
    data: {},
  };
  _activeView = new BehaviorSubject<IView>(this.defaultView);
  private _viewGroupName: string;

  @Input() set viewGroupName(name) {
    this._viewGroupName = name;
    this.views$ = this.store.select(selectTableViews(this._viewGroupName));
    this.pinned$ = this.store
      .select(selectPinnedView(this.viewGroupName))
      .pipe(tap((view) => view && this._activeView.next(view)));
  }
  @Input() viewDataAccessor = () => {};
  @Output() ibViewChanged = new EventEmitter<IView>();

  get viewGroupName() {
    return this._viewGroupName;
  }

  dirty = false;
  views$: Observable<IView[]>;
  pinned$: Observable<IView>;

  get activeView() {
    return this._activeView.value;
  }

  constructor(private store: Store, public viewService: IbViewService) {}

  ngOnInit() {
    this.views$ = this.store.select(selectTableViews(this.viewGroupName));
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
      this.viewService.openSaveAsDialog().subscribe(({ name }) => {
        this.viewService.addView({
          name,
          groupName: this.viewGroupName,
          data: this.viewDataAccessor(),
        });
        this._activeView.next(view);
      });
      return;
    }

    this.viewService.openSaveChangesDialog(this.activeView).subscribe(() => {
      this._activeView.next(
        this.viewService.saveView(view, this.viewDataAccessor())
      );
    });
  }

  handlePinView({ view, pinned }) {
    if (pinned) {
      this.viewService.pinView(view);
    } else {
      this.viewService.unpinView(view);
    }
  }

  handleDiscardChanges() {
    this._activeView.next(this.activeView);
  }
}
