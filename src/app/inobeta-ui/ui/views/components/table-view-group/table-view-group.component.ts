import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Store } from "@ngrx/store";
import { BehaviorSubject, Observable } from "rxjs";
import { IbView, IView, selectTableViews } from "../../store/views";
import { IbViewService } from "../../table-view.service";

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
  }
  @Input() viewDataAccessor = () => {};
  @Output() ibViewChanged = new EventEmitter<IView>();

  get viewGroupName() {
    return this._viewGroupName;
  }

  dirty = false;
  views$: Observable<IView[]>;

  get activeView() {
    return this._activeView.value;
  }

  constructor(private store: Store, public viewService: IbViewService) {}

  ngOnInit() {
    this.views$ = this.store.select(selectTableViews(this.viewGroupName));
  }

  handleAddView(data = this.defaultView.data) {
    this.viewService.openAddViewDialog().subscribe(({ name }) => {
      const view = new IbView<any>({
        name,
        groupName: this.viewGroupName,
        data,
      });
      this.viewService.addView(view);
      this._activeView.next(view);
    });
  }

  handleRemoveView(view: IView) {
    this.viewService.openDeleteViewDialog(view).subscribe(() => {
      this._activeView.next(this.defaultView);
    });
  }

  handleRenameView(view: IView) {
    this.viewService.openRenameViewDialog(view).subscribe();
  }

  handleDuplicateView(view: IView) {
    this.viewService.openDuplicateViewDialog(view).subscribe(({ name }) => {
      const nextView = new IbView<any>({
        name,
        groupName: view.groupName,
        data: this.viewDataAccessor(),
      });
      this.viewService.duplicateView(nextView);
      this._activeView.next(nextView);
    });
  }

  handleSaveView() {
    if (this.activeView.id === this.defaultView.id) {
      this.handleAddView(this.viewDataAccessor());
      return;
    }

    this.viewService.saveView(this.activeView, this.viewDataAccessor());
    this._activeView.next(this.activeView);
  }

  handleChangeView(view: IView) {
    if (!this.dirty) {
      this._activeView.next(view);
      return;
    }

    if (this.activeView.id === this.defaultView.id) {
      this.viewService.openSaveAsDialog().subscribe(({ name }) => {
        const newView = new IbView<any>({
          name,
          groupName: this.viewGroupName,
          data: this.viewDataAccessor(),
        });
        this.viewService.addView(newView);
        this._activeView.next(view);
      });
      return;
    }

    this.viewService
      .openSaveChangesDialog(this.activeView, this.viewDataAccessor())
      .subscribe(() => {
        this._activeView.next(view);
      });
  }

  handleDiscardChanges() {
    this._activeView.next(this.activeView);
  }
}
