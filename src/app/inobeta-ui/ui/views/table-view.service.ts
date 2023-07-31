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
import { IView, TableViewActions } from "./store/views";

@Injectable({ providedIn: "root" })
export class IbViewService {
  get defaultViewLabel() {
    return this.translate.instant("shared.ibTableView.defaultView");
  }

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private translate: TranslateService,
    private toast: IbToastNotification
  ) {}

  addView(view: IView) {
    this.store.dispatch(TableViewActions.addView({ view }));
    this.toast.open("shared.ibTableView.view.added");
  }

  duplicateView(view: IView) {
    this.store.dispatch(TableViewActions.addView({ view }));
    this.toast.open("shared.ibTableView.view.duplicated");
  }

  saveView(view: IView, data: any) {
    this.store.dispatch(
      TableViewActions.saveView({
        id: view.id,
        data,
      })
    );
    this.toast.open("shared.ibTableView.view.saved");
  }

  openDialog(data: IbTableViewDialogData) {
    return this.dialog.open(IbTableViewDialog, {
      width: "480px",
      data,
    });
  }

  openAddViewDialog() {
    const dialog = this.openDialog({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
    });

    return dialog.afterClosed().pipe(skipWhile((result) => !result));
  }

  openDeleteViewDialog(view: IView) {
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
          TableViewActions.deleteView({
            id: view.id,
          })
        );

        this.toast.open("shared.ibTableView.view.removed");
      })
    );
  }

  openRenameViewDialog(view: IView) {
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

  openDuplicateViewDialog(currentView: IView) {
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

    return dialog.afterClosed().pipe(skipWhile((result) => !result));
  }

  openSaveChangesDialog(currentView: IView, data: any) {
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
        this.saveView(currentView, data);
      })
    );
  }

  openSaveAsDialog() {
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
      switchMap(() => this.openAddViewDialog())
    );
  }
}
