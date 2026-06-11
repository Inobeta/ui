import { inject, Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { filter, map } from "rxjs/operators";
import { IbStorageService } from "../../storage";
import { IbToastNotification } from "../toast";
import { IbTableViewDialog } from "./components";
import { IB_VIEWS_STORAGE_KEY } from "./view.tokens";
import { IbViewSnapshot } from "./view.types";

@Injectable({ providedIn: "root" })
export class IbViewService {

  private storageService = inject(IbStorageService);
  private dialog = inject(MatDialog);
  private toast = inject(IbToastNotification);
  private storageKey = inject(IB_VIEWS_STORAGE_KEY);

  getViews(groupName: string, componentType: string): IbViewSnapshot[] {
    return this._readAll(groupName)
      .filter((view) => view.componentType === componentType);
  }

  addView(view: Omit<IbViewSnapshot, 'id'>): IbViewSnapshot {
    const next: IbViewSnapshot = {
      ...view,
      id: this._generateId(),
    };
    const views = [...this._readAll(view.groupName), next];
    this._writeAll(view.groupName, views);
    this.toast.open("shared.ibTableView.addSuccess");
    return next;
  }

  saveView(view: IbViewSnapshot, data: unknown): IbViewSnapshot {
    const updated: IbViewSnapshot = {
      ...view,
      data,
    };

    const views = this._readAll(view.groupName).map((v) => {
      if (v.id !== view.id) {
        return v;
      }
      return updated;
    });

    this._writeAll(view.groupName, views);
    this.toast.open("shared.ibTableView.saveSuccess");
    return updated;
  }

  renameView(view: IbViewSnapshot, newName: string): IbViewSnapshot {
    const updated: IbViewSnapshot = {
      ...view,
      name: newName,
    };

    const views = this._readAll(view.groupName).map((v) => {
      if (v.id !== view.id) {
        return v;
      }
      return updated;
    });

    this._writeAll(view.groupName, views);
    this.toast.open("shared.ibTableView.renameSuccess");
    return updated;
  }

  duplicateView(view: Omit<IbViewSnapshot, 'id'>): IbViewSnapshot {
    return this.addView(view);
  }

  deleteView(view: IbViewSnapshot): void {
    const nextViews = this
      ._readAll(view.groupName)
      .filter((v) => v.id !== view.id);

    this._writeAll(view.groupName, nextViews);
    this.toast.open("shared.ibTableView.deleteSuccess");
  }

  openAddViewDialog(): Observable<{ name: string }> {
    return this.dialog
      .open(IbTableViewDialog, {
        data: {
          title: "shared.ibTableView.addTitle",
          confirm: "shared.ibTableView.add",
        },
      })
      .afterClosed()
      .pipe(filter((result) => !!result && result?.confirmed !== false));
  }

  openDeleteViewDialog(view: IbViewSnapshot): Observable<void> {
    return this.dialog
      .open(IbTableViewDialog, {
        data: {
          title: "shared.ibTableView.deleteTitle",
          message: {
            label: "shared.ibTableView.deleteMessage",
            args: {
              name: view.name,
            },
          },
          confirm: "shared.ibTableView.remove",
          color: "warn",
          hideInput: true,
        },
      })
      .afterClosed()
      .pipe(
        filter((result) => !!result && result?.confirmed !== false),
        map(() => undefined),
      );
  }

  openRenameViewDialog(view: IbViewSnapshot): Observable<{ name: string }> {
    return this.dialog
      .open(IbTableViewDialog, {
        data: {
          title: "shared.ibTableView.renameTitle",
          confirm: "shared.ibTableView.rename",
          viewName: view.name,
        },
      })
      .afterClosed()
      .pipe(filter((result) => !!result && result?.confirmed !== false));
  }

  openDuplicateViewDialog(view: IbViewSnapshot): Observable<{ name: string }> {
    return this.dialog
      .open(IbTableViewDialog, {
        data: {
          title: "shared.ibTableView.duplicateTitle",
          confirm: "shared.ibTableView.duplicate",
          viewName: view.name,
        },
      })
      .afterClosed()
      .pipe(filter((result) => !!result && result?.confirmed !== false));
  }

  openSaveChangesDialog(view: IbViewSnapshot): Observable<{ confirmed: boolean }> {
    return this.dialog
      .open(IbTableViewDialog, {
        data: {
          title: "shared.ibTableView.saveChangesTitle",
          message: {
            label: "shared.ibTableView.saveChangesMessage",
            args: {
              name: view.name,
            },
          },
          confirm: "shared.ibTableView.save",
          hideInput: true,
          hasNo: true,
        },
      })
      .afterClosed()
      .pipe(filter((result) => !!result));
  }

  openSaveAsDialog(): Observable<{ confirmed: boolean; name?: string }> {
    return this.dialog
      .open(IbTableViewDialog, {
        data: {
          title: "shared.ibTableView.saveAsTitle",
          confirm: "shared.ibTableView.save",
          hasNo: true,
        },
      })
      .afterClosed()
      .pipe(filter((result) => !!result));
  }

  private _readAll(groupName: string): IbViewSnapshot[] {
    const stored = this.storageService.get(this._groupStorageKey(groupName));
    if (!stored || !Array.isArray(stored)) {
      return [];
    }
    return stored as IbViewSnapshot[];
  }

  private _writeAll(groupName: string, views: IbViewSnapshot[]): void {
    this.storageService.set(this._groupStorageKey(groupName), views);
  }

  private _groupStorageKey(groupName: string): string {
    return `${this.storageKey}_${groupName}`;
  }

  private _generateId(): string {
    try {
      return crypto.randomUUID();
    } catch {
      return Math.random().toString(36).slice(2);
    }
  }
}
