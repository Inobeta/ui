import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { map, skipWhile, switchMap } from "rxjs/operators";
import { IbTable } from "../kai-table/table.component";
import { IbToastNotification } from "../toast";
import {
  IbTableViewDialog,
  IbTableViewDialogData,
} from "./components/view-dialog/view-dialog.component";
import { TableView, TableViewActions } from "./store/views";

@Injectable({ providedIn: "root" })
export class IbTableViewService {
  get defaultViewLabel() {
    return this.translate.instant("shared.ibTableView.defaultView");
  }

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private translate: TranslateService,
    private toast: IbToastNotification
  ) {}

  openDialog(data: IbTableViewDialogData) {
    return this.dialog.open(IbTableViewDialog, {
      width: "480px",
      data,
    });
  }

  addView(table: IbTable) {
    const dialog = this.openDialog({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
    });

    return dialog.afterClosed().pipe(
      skipWhile((result) => !result),
      map((result) => {
        const view = {
          id: btoa(Math.random().toString()),
          name: result?.name,
          tableName: table.tableName as string,
          filter: table.filter.rawFilter,
          pageSize: table.paginator.pageSize
        };

        this.store.dispatch(TableViewActions.addView({ view }));
        this.toast.open("shared.ibTableView.view.added");
        return view;
      })
    );
  }

  saveView(view: TableView, filter) {
    this.store.dispatch(
      TableViewActions.saveView({
        id: view.id,
        filter,
      })
    );
    this.toast.open("shared.ibTableView.view.saved");
  }

  deleteView(view: TableView) {
    const dialog = this.openDialog({
      title: "shared.ibTableView.removeTitle",
      confirm: "shared.ibTableView.remove",
      message: {
        label: "shared.ibTableView.removeMessage",
        args: { viewName: view.name },
      },
      hideInput: true,
      color: "warn",
    });

    return dialog.afterClosed().pipe(
      skipWhile((result) => !result),
      map(() => {
        this.store.dispatch(
          TableViewActions.removeView({
            id: view.id,
          })
        );

        this.toast.open("shared.ibTableView.view.removed");
      })
    );
  }

  renameView(view: TableView) {
    const dialog = this.openDialog({
      title: "shared.ibTableView.renameTitle",
      confirm: "shared.ibTableView.rename",
      viewName: view.name,
    });

    return dialog.afterClosed().pipe(
      skipWhile((result) => !result),
      map((result) => {
        this.store.dispatch(
          TableViewActions.renameView({
            id: view.id,
            name: result.name,
          })
        );

        this.toast.open("shared.ibTableView.view.renamed");
      })
    );
  }

  duplicateView(currentView: TableView, filter: any) {
    const dialog = this.openDialog({
      title: "shared.ibTableView.duplicateTitle",
      confirm: "shared.ibTableView.add",
      viewName: this.translate.instant(
        "shared.ibTableView.duplicatePlaceholder",
        {
          viewName: currentView.name,
        }
      ),
    });

    return dialog.afterClosed().pipe(
      skipWhile((result) => !result),
      map((result) => {
        const view = {
          id: btoa(Math.random().toString()),
          name: result.name,
          tableName: currentView.tableName,
          filter,
        };

        this.store.dispatch(
          TableViewActions.addView({
            view,
          })
        );

        this.toast.open("shared.ibTableView.view.duplicated");
        return view;
      })
    );
  }

  askShouldSaveChanges(currentView: TableView, filter: any) {
    const dialog = this.openDialog({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      message: {
        label: "shared.ibTableView.unsavedView",
        args: {
          viewName: currentView.name,
        },
      },
      hideInput: true,
    });

    return dialog.afterClosed().pipe(
      skipWhile((result) => !result),
      map(() => {
        this.saveView(currentView, filter);
      })
    );
  }

  askShouldSaveAs(table: IbTable) {
    const dialog = this.openDialog({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      message: {
        label: "shared.ibTableView.unsavedUnnamedView",
      },
      hideInput: true,
    });

    return dialog.afterClosed().pipe(
      skipWhile((result) => !result),
      switchMap(() => this.addView(table))
    );
  }
}
