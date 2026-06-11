/**
 * Snapshot representation of a saved view/state for UI views (tables/charts/etc...).
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
}

/** Default view id used when no view is selected, as a fallback not to be saved */
export const DEFAULT_VIEW_ID = '__ibTableView__all';
