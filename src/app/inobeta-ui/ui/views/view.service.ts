import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { map, skipWhile, switchMap } from "rxjs/operators";
import { IbToastNotification } from "../toast";
import {
  IbTableViewDialog,
  IbTableViewDialogData,
} from "./components/view-dialog/view-dialog.component";
import { IbViewStorageService } from "./view-storage.service";
import { IbSavedView, IbViewSnapshot, IbView, IView } from "./view.types";

/** Sentinel ID for the implicit Default (all-data) view. */
const DEFAULT_VIEW_SENTINEL = '__ibTableView__all';

/**
 * Domain service for table view CRUD, dialogs and name validation.
 *
 * Replaces the previous NgRx store-based implementation with dedicated
 * per-table localStorage persistence. All method signatures remain
 * structurally compatible with the current {@link IbTableViewGroup}
 * component (full migration to typed dialog results happens in Step 3).
 */
@Injectable({ providedIn: "root" })
export class IbViewService {
  constructor(
    private storage: IbViewStorageService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private toast: IbToastNotification
  ) {}

  // ---------------------------------------------------------------------------
  // Reactive state accessors (new in DEVK-1065)
  // ---------------------------------------------------------------------------

  /**
   * Returns a reactive stream of views for a single group.
   *
   * Converts stored {@link IbSavedView} instances to the backward-compatible
   * {@link IView} format consumed by the host component.
   */
  viewsForGroup(groupName: string): Observable<IView[]> {
    return this.storage
      .watchViews(groupName)
      .pipe(
        map((savedViews) =>
          savedViews.map((sv) => this._savedToIView(sv, groupName))
        )
      );
  }

  /**
   * Synchronously resolves a view by ID within a group.
   *
   * Returns `null` for Default sentinel, unknown IDs, or an empty group.
   */
  resolveView(groupName: string, viewId: string): IView | null {
    if (this._isDefaultSentinel(viewId)) {
      return null;
    }
    const saved = this.storage.resolveView(groupName, viewId);
    return saved ? this._savedToIView(saved, groupName) : null;
  }

  // ---------------------------------------------------------------------------
  // CRUD operations (backward-compatible signatures, localStorage-backed)
  // ---------------------------------------------------------------------------

  /**
   * Creates a new named view and appends it to the group.
   *
   * Default sentinel operations are silently rejected.
   */
  addView(viewDef: Partial<IView>): IView {
    const name = this._normalizeName(viewDef.name ?? '');
    const groupName = viewDef.groupName ?? '';

    const savedView: IbSavedView = {
      id: this.storage.generateId(),
      name,
      data: this._extractSnapshot(viewDef.data),
    };

    try {
      this.storage.createView(groupName, savedView);
      this.toast.open("shared.ibTableView.view.added");
      return this._savedToIView(savedView, groupName);
    } catch {
      this.toast.open("shared.ibTableView.storageError", "error");
      // Return a minimal view so the caller has something; the write
      // failure toast already informed the user.
      return this._savedToIView(savedView, groupName);
    }
  }

  /**
   * Creates a duplicate of an existing view's data under a new name.
   */
  duplicateView(viewDef: Partial<IView>): IView {
    const savedView: IbSavedView = {
      id: this.storage.generateId(),
      name: this._normalizeName(viewDef.name ?? ''),
      data: this._extractSnapshot(viewDef.data),
    };

    try {
      this.storage.createView(viewDef.groupName!, savedView);
      this.toast.open("shared.ibTableView.view.duplicated");
      return this._savedToIView(savedView, viewDef.groupName!);
    } catch {
      this.toast.open("shared.ibTableView.storageError", "error");
      return this._savedToIView(savedView, viewDef.groupName!);
    }
  }

  /**
   * Saves the current table state into an existing view.
   *
   * Default sentinel operations are silently rejected (the caller should
   * route through {@link addView} instead).
   */
  saveView(view: IView, data: unknown): IView {
    if (this._isDefaultSentinel(view.id)) {
      return view;
    }

    const snapshot = this._extractSnapshot(data);

    try {
      this.storage.saveView(view.groupName, view.id, snapshot);
      this.toast.open("shared.ibTableView.view.saved");
      return { ...view, data: { ...view.data, ...this._snapshotToViewData(snapshot) } };
    } catch {
      this.toast.open("shared.ibTableView.storageError", "error");
      return view;
    }
  }

  /**
   * Deletes a view from its group.
   *
   * Default sentinel operations are silently rejected.
   */
  deleteView(view: IView): void {
    if (this._isDefaultSentinel(view.id)) {
      return;
    }

    try {
      this.storage.deleteView(view.groupName, view.id);
      this.toast.open("shared.ibTableView.view.removed");
    } catch {
      this.toast.open("shared.ibTableView.storageError", "error");
    }
  }

  /**
   * Renames a view in place without changing its position or data.
   *
   * The name is trimmed. Default sentinel operations are silently rejected.
   */
  renameView(view: IView, name: string): IView {
    if (this._isDefaultSentinel(view.id)) {
      return view;
    }

    const normalized = this._normalizeName(name);

    try {
      this.storage.renameView(view.groupName, view.id, normalized);
      this.toast.open("shared.ibTableView.view.renamed");
      return { ...view, name: normalized };
    } catch {
      this.toast.open("shared.ibTableView.storageError", "error");
      return view;
    }
  }

  /**
   * Persists a new view order (e.g. after drag-and-drop reorder).
   */
  reorderViews(groupName: string, views: IView[]): void {
    const savedViews: IbSavedView[] = views.map((v) => ({
      id: v.id,
      name: v.name,
      data: this._extractSnapshot(v.data),
    }));

    try {
      this.storage.reorderViews(groupName, savedViews);
    } catch {
      this.toast.open("shared.ibTableView.storageError", "error");
    }
  }

  // ---------------------------------------------------------------------------
  // Name validation (new in DEVK-1065)
  // ---------------------------------------------------------------------------

  /**
   * Validates a view name for a group.
   *
   * Returns `null` when the name is valid, or a translation key
   * describing the validation error.
   *
   * @param groupName  The table/group to check uniqueness within.
   * @param name       The raw user input (will be trimmed).
   * @param excludeId  Optional view ID to exclude from duplicate checks
   *                   (permits a view to keep its own normalized name).
   */
  validateViewName(
    groupName: string,
    name: string,
    excludeId?: string
  ): string | null {
    const normalized = this._normalizeName(name);

    if (normalized.length === 0) {
      return 'shared.ibTableView.nameRequired';
    }

    const views = this.storage.getViews(groupName);
    const duplicate = views.find(
      (v) =>
        v.name.toLowerCase() === normalized.toLowerCase() &&
        v.id !== excludeId
    );

    if (duplicate) {
      return 'shared.ibTableView.duplicateName';
    }

    return null;
  }

  // ---------------------------------------------------------------------------
  // Dialog methods (backward-compatible signatures)
  // ---------------------------------------------------------------------------

  /** Opens a configurable view dialog. */
  openDialog(data: IbTableViewDialogData) {
    return this.dialog.open(IbTableViewDialog, {
      width: "480px",
      data,
    });
  }

  /** Opens the "create new view" name dialog. */
  openAddViewDialog() {
    const dialog = this.openDialog({
      title: "shared.ibTableView.addTitle",
      confirm: "shared.ibTableView.add",
    });

    return dialog.afterClosed().pipe(skipWhile((result) => !result));
  }

  /** Opens the "confirm delete" dialog. */
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

  /** Opens the "rename view" name dialog. */
  openRenameViewDialog(view: IView) {
    const dialog = this.openDialog({
      title: "shared.ibTableView.renameTitle",
      confirm: "shared.ibTableView.rename",
      viewName: view.name,
    });

    return dialog.afterClosed().pipe(skipWhile((result) => !result));
  }

  /** Opens the "duplicate view" name dialog. */
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

  /** Opens the "unsaved changes — save?" dialog (binary yes/no). */
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
      hideCancel: true,
      hasNo: true,
    });

    return dialog.afterClosed().pipe(skipWhile((result) => !result));
  }

  /** Opens the "save default as new view?" dialog, chaining the name dialog. */
  openSaveAsDialog() {
    const dialog = this.openDialog({
      title: "shared.ibTableView.unsavedTitle",
      confirm: "shared.ibTableView.save",
      message: {
        label: "shared.ibTableView.unsavedUnnamedView",
      },
      hideInput: true,
      hideCancel: true,
      hasNo: true,
    });

    return dialog.afterClosed().pipe(
      skipWhile((result) => !result),
      switchMap((result) =>
        result.confirmed ? this.openAddViewDialog() : of(result)
      )
    );
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Extracts a canonical {@link IbViewSnapshot} from the various data shapes
   * that callers may pass (full {@link IView.data}, {@link IbTableViewsData},
   * or partial objects).
   *
   * Normalises an empty sort to `null` for a cleaner stored representation.
   */
  private _extractSnapshot(
    data: unknown
  ): IbViewSnapshot {
    const d = (data ?? {}) as Record<string, unknown>;
    const filters = (d['filters'] ?? null) as IbViewSnapshot['filters'];
    const rawSort = d['sort'] as IbViewSnapshot['sort'] | undefined;

    // Treat an empty sort {active:'', direction:''} as null
    const sort: IbViewSnapshot['sort'] =
      rawSort && (rawSort.active || rawSort.direction) ? rawSort : null;

    return {
      filters,
      sort,
      pageSize: (d['pageSize'] as number) ?? 20,
      aggregatedColumns:
        (d['aggregatedColumns'] as Record<string, string>) ?? {},
    };
  }

  /**
   * Converts a stored {@link IbViewSnapshot} back to the shape expected
   * by `IView.data`.
   */
  private _snapshotToViewData(snapshot: IbViewSnapshot): IView['data'] {
    return {
      filter: {} as IView['data']['filter'],
      filters: snapshot.filters,
      pageSize: snapshot.pageSize,
      aggregatedColumns: snapshot.aggregatedColumns,
      sort: snapshot.sort ?? { active: '', direction: '' },
    };
  }

  /**
   * Converts a stored {@link IbSavedView} to the backward-compatible
   * {@link IView} format.
   */
  private _savedToIView(sv: IbSavedView, groupName: string): IView {
    return new IbView({
      id: sv.id,
      name: sv.name,
      groupName,
      data: this._snapshotToViewData(sv.data),
    });
  }

  /** Trims whitespace from a view name. */
  private _normalizeName(name: string): string {
    return name?.trim() ?? '';
  }

  /** Checks whether a view ID is the Default sentinel. */
  private _isDefaultSentinel(id: string | null | undefined): boolean {
    return id === DEFAULT_VIEW_SENTINEL || id === null || id === undefined;
  }
}
