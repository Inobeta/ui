/**
 * Snapshot representation of a saved view/state for UI views (tables/cards/etc.).
 *
 * Note: the `initial` flag is an internal runtime-only marker and MUST NOT be
 * persisted to localStorage; stored representations should omit this field.
 */
export interface IbViewSnapshot {
  /** Unique view identifier */
  id: string;
  /** Human readable name for the view */
  name: string;
  /** Optional grouping name for organizing views */
  groupName: string;
  /** The component type identifier this view belongs to */
  componentType: string;
  /** Arbitrary view-specific data (filters, column order, etc.) */
  data: unknown;
  /** Internal runtime-only flag. Do NOT persist to storage. */
  initial?: boolean;
}

/** Default view id used for the "all" / fallback view */
export const DEFAULT_VIEW_ID = '__ibTableView__all';
