import { Sort } from "@angular/material/sort";
import {
  IbKaiTableSnapshot,
  IbKaiTableUrlParams,
  IbTableFilterState,
} from "./table.types";

// ---------------------------------------------------------------------------
// V2 payload (compact field names to save URL space)
// ---------------------------------------------------------------------------

interface IbKaiTableUrlV2Payload {
  v: 2;
  /** filters — raw form values, or null when no filter active */
  f: IbTableFilterState | null;
  /** selectedView — view ID, or null for "all data" default */
  sv: string | null;
  /** pageIndex — zero-based page */
  pi: number;
  /** pageSize — rows per page */
  ps: number;
  /** aggregatedColumns — column → aggregate function map */
  ac: Record<string, string> | null;
  /** sort — active sort matcher */
  so: Sort | null;
}

// ---------------------------------------------------------------------------
// V2 payload detection (boolean, not type predicate — IbKaiTableUrlV2Payload
// lacks an index signature so TS won't allow narrowing from Record<string,unknown>).
// ---------------------------------------------------------------------------

function isV2Payload(o: Record<string, unknown>): boolean {
  return o["v"] === 2;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Decodes a raw URL query-param value (JSON string) into a
 * {@link IbKaiTableUrlParams} patch that distinguishes absent keys
 * from keys present with `null`.
 *
 * ## Supported formats
 *
 * - **v2** — `{"v":2,"f":...,"sv":...,"pi":0,"ps":20,"ac":...,"so":...}`
 * - **Legacy (v1)** — `{"ibfilter":...,"ibview":...,"ibpage":...,"ibpagesize":...,...}`
 *
 * ## Error handling
 *
 * - `null` / empty input → returns `null` (no URL state for this table)
 * - Malformed JSON (unparseable) → returns `null` silently
 * - Wrong type for individual fields → field is ignored (absent), or
 *   normalized to `null` for nullable fields
 * - Legacy sentinel `__ibTableView__all` → mapped to `view: null`
 *
 * @param raw — Raw `queryParams[tableName]` string or `null`.
 * @returns Decoded params with presence info, or `null` for empty/malformed.
 */
export function decodeUrlPayload(raw: string | null): IbKaiTableUrlParams | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // Malformed JSON → ignore and let downstream normalize
    return null;
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return null;
  }

  const obj = parsed as Record<string, unknown>;

  if (isV2Payload(obj)) {
    return decodeV2(obj as unknown as IbKaiTableUrlV2Payload);
  }

  // Fallback: try legacy v1 format
  return decodeLegacy(obj);
}

/**
 * Encodes a full {@link IbKaiTableSnapshot} into a v2 JSON string suitable
 * for use as a URL query-param value.
 *
 * Always produces a complete payload; never writes the legacy sentinel
 * `__ibTableView__all`.
 *
 * @param snapshot — Fully resolved table state to persist.
 * @returns JSON string for the `tableName` query parameter.
 */
export function encodeUrlPayload(snapshot: IbKaiTableSnapshot): string {
  const payload: IbKaiTableUrlV2Payload = {
    v: 2,
    f: snapshot.filters,
    sv: snapshot.selectedView,
    pi: snapshot.pageIndex,
    ps: snapshot.pageSize,
    ac: isEmptyRecord(snapshot.aggregatedColumns) ? null : snapshot.aggregatedColumns,
    so: snapshot.sort,
  };
  return JSON.stringify(payload);
}

// ---------------------------------------------------------------------------
// V2 decoder
// ---------------------------------------------------------------------------

function decodeV2(p: IbKaiTableUrlV2Payload): IbKaiTableUrlParams {
  const params: IbKaiTableUrlParams = {};

  if ("f" in (p as object)) {
    params.filters = isRecord(p.f) ? p.f : null;
  }
  if ("sv" in (p as object)) {
    params.view = typeof p.sv === "string" ? p.sv : null;
  }
  if ("pi" in (p as object)) {
    params.pageIndex = isValidPageNumber(p.pi) ? p.pi : null;
  }
  if ("ps" in (p as object)) {
    params.pageSize = isValidPageNumber(p.ps) ? p.ps : null;
  }
  if ("ac" in (p as object)) {
    params.aggregatedColumns = toAggregatedColumns(p.ac);
  }
  if ("so" in (p as object)) {
    params.sort = isValidSort(p.so) ? p.so : null;
  }

  return params;
}

// ---------------------------------------------------------------------------
// Legacy (v1) decoder
// ---------------------------------------------------------------------------

function decodeLegacy(p: Record<string, unknown>): IbKaiTableUrlParams {
  const params: IbKaiTableUrlParams = {};

  // ibview — map sentinel to null
  if ("ibview" in p) {
    const v = p.ibview;
    if (v === "__ibTableView__all") {
      params.view = null;
    } else if (typeof v === "string") {
      params.view = v;
    } else {
      params.view = null;
    }
  }

  // ibfilter
  if ("ibfilter" in p) {
    params.filters = isRecord(p.ibfilter) ? p.ibfilter : null;
  }

  // ibpage
  if ("ibpage" in p) {
    params.pageIndex = isValidPageNumber(p.ibpage) ? p.ibpage : null;
  }

  // ibpagesize
  if ("ibpagesize" in p) {
    params.pageSize = isValidPageNumber(p.ibpagesize) ? p.ibpagesize : null;
  }

  // ibaggregatedcolumns
  if ("ibaggregatedcolumns" in p) {
    params.aggregatedColumns = toAggregatedColumns(p.ibaggregatedcolumns);
  }

  // ibsort
  if ("ibsort" in p) {
    params.sort = isValidSort(p.ibsort) ? p.ibsort : null;
  }

  return params;
}

// ---------------------------------------------------------------------------
// Type guards & validators
// ---------------------------------------------------------------------------

/** Returns true when `v` is a non-null object that is NOT an array. */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Casts a validated Record<string,unknown> to Record<string,string>. */
function toAggregatedColumns(v: unknown): Record<string, string> | null {
  if (!isRecord(v)) return null;
  return v as Record<string, string>;
}

/** Returns true for a finite, non-negative integer. */
function isValidPageNumber(v: unknown): v is number {
  return (
    typeof v === "number" &&
    Number.isFinite(v) &&
    v >= 0 &&
    Number.isInteger(v)
  );
}

/** Returns true when `v` is a valid Angular Material `Sort` shape. */
function isValidSort(v: unknown): v is Sort {
  if (typeof v !== "object" || v === null) return false;
  const s = v as Partial<Sort>;
  return (
    typeof s.active === "string" &&
    typeof s.direction === "string"
  );
}

/** Returns true when the record has no own enumerable string keys. */
function isEmptyRecord(v: Record<string, string> | null): boolean {
  if (!v) return true;
  for (const key of Object.keys(v)) {
    if (typeof key === "string") return false;
  }
  return true;
}
