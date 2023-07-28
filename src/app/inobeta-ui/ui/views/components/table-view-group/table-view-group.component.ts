import { AfterViewInit, Component, Optional } from "@angular/core";
import { Store } from "@ngrx/store";
import { BehaviorSubject, Subscription } from "rxjs";
import { IbTable } from "../../../kai-table";
import { selectTableViews, TableView } from "../../store/views";
import { IbTableViewService } from "../../table-view.service";

@Component({
  selector: "ib-table-view-group",
  templateUrl: "./table-view-group.component.html",
})
export class IbTableViewGroup implements AfterViewInit {
  isDirty = false;
  _activeView = new BehaviorSubject<TableView>(this.defaultView);
  views$ = this.store.select(
    selectTableViews(this.ibTable.tableName as string)
  );

  get activeView() {
    return this._activeView.value;
  }

  get defaultView(): TableView {
    return {
      id: "__ibTableView__all",
      name: this.view.defaultViewLabel,
      tableName: this.ibTable?.tableName as string,
      filter: this.ibTable?.filter?.initialRawValue,
    };
  }

  constructor(
    /** @ignore */ @Optional() public ibTable: IbTable,
    private store: Store,
    private view: IbTableViewService
  ) {}

  ngAfterViewInit(): void {
    if (this.ibTable?.filter) {
      this._activeView.subscribe((nextView) => {
        if (nextView.id === this.defaultView.id) {
          this.ibTable.filter.reset();
          return;
        }

        this.ibTable.filter.value = nextView.filter;
      });

      this.ibTable.filter.ibRawFilterUpdated.subscribe((rawFilter) => {
        this.isDirty =
          JSON.stringify(rawFilter) !== JSON.stringify(this.activeView.filter);
      });
    }
  }

  handleAddView() {
    this.view
      .addView(this.ibTable)
      .subscribe((view) => this._activeView.next(view));
  }

  handleRemoveView(view: TableView) {
    this.view.deleteView(view).subscribe(() => {
      this._activeView.next(this.defaultView);
    });
  }

  handleRenameView(view: TableView) {
    this.view.renameView(view).subscribe();
  }

  handleDuplicateView(view: TableView) {
    this.view
      .duplicateView(view, this.ibTable.filter.rawFilter)
      .subscribe(() => {
        this._activeView.next(view);
      });
  }

  handleSaveView() {
    if (this.activeView.id === this.defaultView.id) {
      this.handleAddView();
      return;
    }

    this.view.saveView(this.activeView, this.ibTable.filter.rawFilter);
    this._activeView.next(this.activeView);
  }

  handleChangeView(view: TableView) {
    if (!this.isDirty) {
      this._activeView.next(view);
      return;
    }

    this.view
      .askShouldSaveChanges(this.activeView, this.ibTable.filter.rawFilter)
      .subscribe(() => {
        this._activeView.next(view);
      });
  }

  handleDiscardChanges() {
    this.ibTable.filter.value = this.activeView.filter;
  }
}
