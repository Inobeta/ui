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
  private _activeView = new BehaviorSubject<TableView>(this.defaultView);

  isDirty = false;
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
        this.ibTable.filter.value = nextView.filter;
        this.ibTable.paginator.pageSize =
          nextView.pageSize ?? this.ibTable.tableDef.paginator.pageSize;
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
    this.view.duplicateView(view, this.ibTable).subscribe((nextView) => {
      this._activeView.next(nextView);
    });
  }

  handleSaveView() {
    if (this.activeView.id === this.defaultView.id) {
      this.handleAddView();
      return;
    }

    this.view.saveView(this.activeView, this.ibTable);
    this._activeView.next(this.activeView);
  }

  handleChangeView(view: TableView) {
    if (!this.isDirty) {
      this._activeView.next(view);
      return;
    }

    if (this.activeView.id === this.defaultView.id) {
      this.view.askShouldSaveAs(this.ibTable).subscribe(() => {
        this._activeView.next(view);
      });
      return;
    }

    this.view
      .askShouldSaveChanges(this.activeView, this.ibTable)
      .subscribe(() => {
        this._activeView.next(view);
      });
  }

  handleDiscardChanges() {
    this.ibTable.filter.value = this.activeView.filter;
  }
}
