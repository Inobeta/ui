import { Inject, Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { IB_VIEWS_STORAGE_KEY } from "./view.tokens";
import { IbSavedView, IbViewsStorageEnvelope } from "./view.types";

/**
 * Local-storage persistence for the Views feature.
 *
 * Stores a versioned envelope under `<prefix>:<groupName>` for each table.
 * Exposes a reactive per-group view list. Read errors (missing key, malformed
 * JSON, invalid shape) return an empty array without throwing. Write failures
 * throw so the caller can notify the user while retaining the previous
 * in-memory state.
 *
 * @remarks
 * This service does **not** listen to the browser `storage` event. Changes
 * made by other tabs become visible after a reload.
 */
@Injectable({ providedIn: 'root' })
export class IbViewStorageService implements OnDestroy {
  /** In-memory reactive state keyed by group name. */
  private _groups = new Map<string, BehaviorSubject<IbSavedView[]>>();

  constructor(
    @Inject(IB_VIEWS_STORAGE_KEY) private _keyPrefix: string
  ) { }

  /** @internal Clean up subscriptions on destroy. */
  ngOnDestroy(): void {
    this._groups.forEach((s) => s.complete());
    this._groups.clear();
  }

  /**
   * Returns a reactive stream of saved views for a group.
   *
   * The initial emission reads from localStorage; subsequent emissions
   * reflect local mutations.
   */
  watchViews(groupName: string): Observable<IbSavedView[]> {
    return this._ensureGroup(groupName).asObservable();
  }

  /**
   * Returns a one-shot snapshot of saved views for a group.
   */
  getViews(groupName: string): IbSavedView[] {
    return this._ensureGroup(groupName).value;
  }

  /**
   * Resolves a view by ID within a group, or `null` if not found.
   */
  resolveView(groupName: string, viewId: string): IbSavedView | null {
    const views = this.getViews(groupName);
    return views.find((v) => v.id === viewId) ?? null;
  }

  /**
   * Creates a new view and appends it to the group array.
   *
   * @throws If localStorage write fails (toast notification handled by caller).
   */
  createView(groupName: string, view: IbSavedView): void {
    const views = [...this.getViews(groupName), view];
    this._persist(groupName, views);
  }

  /**
   * Saves (updates in place) an existing view's data without changing its
   * position or ID.
   *
   * @throws If localStorage write fails.
   */
  saveView(
    groupName: string,
    viewId: string,
    data: IbSavedView['data']
  ): void {
    const views = this.getViews(groupName).map((v) =>
      v.id === viewId ? { ...v, data } : v
    );
    this._persist(groupName, views);
  }

  /**
   * Renames a view in place without changing its position.
   *
   * @throws If localStorage write fails.
   */
  renameView(groupName: string, viewId: string, name: string): void {
    const views = this.getViews(groupName).map((v) =>
      v.id === viewId ? { ...v, name } : v
    );
    this._persist(groupName, views);
  }

  /**
   * Deletes a view from the group.
   *
   * @throws If localStorage write fails.
   */
  deleteView(groupName: string, viewId: string): void {
    const views = this.getViews(groupName).filter((v) => v.id !== viewId);
    this._persist(groupName, views);
  }

  /**
   * Persists a new view order (e.g. after drag-and-drop reorder).
   *
   * The supplied array replaces the group's view list entirely.
   *
   * @throws If localStorage write fails.
   */
  reorderViews(groupName: string, views: IbSavedView[]): void {
    this._persist(groupName, views);
  }

  /**
   * Generates a stable unique identifier.
   *
   * Uses `crypto.randomUUID()` when available, with a non-blocking
   * fallback based on timestamp and randomness for older environments.
   */
  generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch {
        // Fall through to fallback
      }
    }
    // Fallback: base-36 timestamp + random suffix
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns the existing `BehaviorSubject` for a group, or initialises one
   * by reading from localStorage.
   */
  private _ensureGroup(groupName: string): BehaviorSubject<IbSavedView[]> {
    let subject = this._groups.get(groupName);
    if (!subject) {
      const views = this._readStored(groupName);
      subject = new BehaviorSubject<IbSavedView[]>(views);
      this._groups.set(groupName, subject);
    }
    return subject;
  }

  /** Builds the per-group localStorage key. */
  private _storageKey(groupName: string): string {
    return `${this._keyPrefix}:${groupName}`;
  }

  /**
   * Reads and validates the stored envelope for a group.
   *
   * Returns an empty array when the key is missing, the JSON is malformed,
   * or the envelope shape is invalid — the consumer sees a clean empty state.
   */
  private _readStored(groupName: string): IbSavedView[] {
    try {
      const raw = localStorage.getItem(this._storageKey(groupName));
      if (!raw) {
        return [];
      }

      const parsed: unknown = JSON.parse(raw);
      if (!this._isValidEnvelope(parsed)) {
        return [];
      }

      return parsed.views;
    } catch {
      // JSON parse error or localStorage unavailable
      return [];
    }
  }

  /**
   * Writes the view list to localStorage and updates the in-memory subject.
   *
   * The in-memory state is updated **only after** a successful write.
   * On failure, the previous state is retained and the error is re-thrown
   * so the caller can show a toast.
   */
  private _persist(groupName: string, views: IbSavedView[]): void {
    const envelope: IbViewsStorageEnvelope = { version: 1, views };
    const json = JSON.stringify(envelope);


    try {
      localStorage.setItem(this._storageKey(groupName), json);
    } catch {
      throw new Error(
        `Failed to write views for group "${groupName}" to localStorage`
      );
    }

    // Update in-memory state after confirmed write
    const subject = this._ensureGroup(groupName);
    subject.next(views);
  }

  /**
   * Validates that a parsed value conforms to the expected envelope shape.
   */
  private _isValidEnvelope(value: unknown): value is IbViewsStorageEnvelope {
    return (
      typeof value === 'object' &&
      value !== null &&
      (value as Record<string, unknown>).version === 1 &&
      Array.isArray((value as Record<string, unknown>).views)
    );
  }
}
