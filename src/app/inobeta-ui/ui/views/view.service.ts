import { inject, Inject, Injectable } from "@angular/core";
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

  constructor(
    @Inject(IB_VIEWS_STORAGE_KEY) private storageKey: string,
  ) { }

  getViews(groupName: string, componentType: string): IbViewSnapshot[] {
    return this._readAll(groupName).filter((view) => view.componentType === componentType);
  }

  addView(
    p: Pick<IbViewSnapshot, "name" | "groupName" | "componentType" | "data">,
  ): IbViewSnapshot {
    const next: IbViewSnapshot = {
      id: this._generateId(),
      name: p.name,
      groupName: p.groupName,
      componentType: p.componentType,
      data: p.data,
    };

    const views = [...this._readAll(p.groupName), next];
    this._writeAll(p.groupName, views);
    this.toast.open("shared.ibTableView.addSuccess");
    return next;
  }

  saveView(snapshot: IbViewSnapshot, data: unknown): IbViewSnapshot {
    const updated: IbViewSnapshot = {
      ...snapshot,
      data,
    };

    const views = this._readAll(snapshot.groupName).map((view) => {
      if (view.id !== snapshot.id) {
        return view;
      }
      return updated;
    });

    this._writeAll(snapshot.groupName, views);
    this.toast.open("shared.ibTableView.saveSuccess");
    return updated;
  }

  renameView(snapshot: IbViewSnapshot, newName: string): IbViewSnapshot {
    const updated: IbViewSnapshot = {
      ...snapshot,
      name: newName,
    };

    const views = this._readAll(snapshot.groupName).map((view) => {
      if (view.id !== snapshot.id) {
        return view;
      }
      return updated;
    });

    this._writeAll(snapshot.groupName, views);
    this.toast.open("shared.ibTableView.renameSuccess");
    return updated;
  }

  duplicateView(
    p: Pick<IbViewSnapshot, "name" | "groupName" | "componentType" | "data">,
  ): IbViewSnapshot {
    return this.addView(p);
  }

  deleteView(snapshot: IbViewSnapshot): void {
    const nextViews = this
      ._readAll(snapshot.groupName)
      .filter((view) => view.id !== snapshot.id);

    this._writeAll(snapshot.groupName, nextViews);
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
    const sanitizedViews = views.map((view) => {
      const { initial: _, ...persisted } = view;
      return persisted;
    });

    this.storageService.set(this._groupStorageKey(groupName), sanitizedViews);
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
