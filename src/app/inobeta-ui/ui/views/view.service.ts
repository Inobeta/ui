import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { map, skipWhile, switchMap } from "rxjs/operators";
import { IbToastNotification } from "../toast";
import {
  IbTableViewDialog,
  IbTableViewDialogData,
} from "./components/view-dialog/view-dialog.component";
import { TableViewActions } from "./store/actions";
import { IbView, IView } from "./store/views/table-view";

@Injectable({ providedIn: "root" })
export class IbViewService {
  constructor(
    private store: Store,
    private dialog: MatDialog,
    private translate: TranslateService,
    private toast: IbToastNotification
  ) {}

  addView(viewDef: Partial<IView>) {
    const view = new IbView<any>(viewDef);
    this.store.dispatch(TableViewActions.addView({ view }));
    this.toast.open("shared.ibTableView.view.added");
    return view;
  }
  
  duplicateView(viewDef: Partial<IView>) {
    const view = new IbView<any>(viewDef);
    this.store.dispatch(TableViewActions.addView({ view }));
    this.toast.open("shared.ibTableView.view.duplicated");
    return view;
  }

  saveView(view: IView, data: any) {
    this.store.dispatch(
      TableViewActions.saveView({
        id: view.id,
        data,
      })
    );
    this.toast.open("shared.ibTableView.view.saved");
    return { ...view, data };
  }

  deleteView(view: IView) {
    this.store.dispatch(
      TableViewActions.deleteView({
        id: view.id,
      })
    );

    this.toast.open("shared.ibTableView.view.removed");
  }

  renameView(view: IView, name: string) {
    this.store.dispatch(
      TableViewActions.renameView({
        id: view.id,
        name,
      })
    );

    this.toast.open("shared.ibTableView.view.renamed");
    return { ...view, name };
  }

  pinView(view: IView) {
    this.store.dispatch(
      TableViewActions.pinView({
        groupName: view.groupName,
        id: view.id,
      })
    );
    this.toast.open("shared.ibTableView.view.pinned");
  }

  unpinView(view: IView) {
    this.store.dispatch(
      TableViewActions.unpinView({
        groupName: view.groupName,
        id: view.id,
      })
    );
    this.toast.open("shared.ibTableView.view.unpinned");
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

    return dialog.afterClosed().pipe(skipWhile((result) => !result));
  }

  openRenameViewDialog(view: IView) {
    const dialog = this.openDialog({
      title: "shared.ibTableView.renameTitle",
      confirm: "shared.ibTableView.rename",
      viewName: view.name,
    });

    return dialog.afterClosed().pipe(skipWhile((result) => !result));
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

  openSaveChangesDialog(currentView: IView) {
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

    return dialog.afterClosed().pipe(skipWhile((result) => !result));
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
