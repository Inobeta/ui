import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { filter, switchMap, take, tap } from "rxjs/operators";
import { urlStateActions, tableStateActions } from "./actions";
import { IbTableUrlService } from "../../table-url.service";
import { selectIbKaiTableSnapshot } from "..";

@Injectable({providedIn: "root"})
export class UrlStateEffects {

  actions$ = inject(Actions);
  tableUrlService = inject(IbTableUrlService);
  store = inject(Store);

  // =========================================================================
  // LEGACY Effects (urlStateActions) — kept for backward compatibility
  //
  // These effects write partial state using the legacy URL format.  They
  // are intentionally left unchanged so existing consumers continue to
  // work during the migration window.
  // =========================================================================

  setFilters$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(urlStateActions.setFilters),
      tap((action) => this.tableUrlService.setFilters(action.tableName, action.params))
    )
  }, {
    dispatch: false
  });

  setPaginator$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(urlStateActions.setPaginator),
      tap((action) => this.tableUrlService.setPaginator(action.tableName, action.params))
    )
  }, {
    dispatch: false
  });

  setAggregatedColumns$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(urlStateActions.setAggregatedColumns),
      tap((action) => this.tableUrlService.setAggregatedColumns(action.tableName, action.params))
    )
  }, {
    dispatch: false
  });

  setSort$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(urlStateActions.setSort),
      tap((action) => this.tableUrlService.setSort(action.tableName, action.params))
    )
  }, {
    dispatch: false
  });

  handleViewChange$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(urlStateActions.handleViewChange),
      tap((action) => this.tableUrlService.handleViewChange(action.tableName, action.params))
    )
  }, {
    dispatch: false
  });

  setRemoteDatasourceParams$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(urlStateActions.setRemoteDatasourceParams),
      tap((action) => this.tableUrlService.setFilterAndSort(action.tableName, action.filters, action.sort))
    )
  }, {
    dispatch: false
  });

  // =========================================================================
  // NEW Canonical Effect (tableStateActions)
  //
  // A single effect handles all user-persistible state changes.  After the
  // reducer has processed the action, the effect reads the **full**
  // canonical snapshot from the store and writes a complete v2 payload to
  // the URL (replaceUrl, merge).  This eliminates the race-prone partial
  // merge that the legacy effects performed.
  //
  // `initialize` and `hydrateFromUrl` intentionally do NOT trigger URL
  // writes — their purpose is to ingest state, not to persist it.
  // =========================================================================

  /**
   * Persists the full table state to the URL after any user-driven state
   * mutation (filter, sort, paginator, aggregation, view switch).
   *
   * Uses `switchMap` + `store.select` + `take(1)` to read the
   * post-reducer state exactly once per action, avoiding stale reads
   * and double writes.
   */
  persistState$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(
        tableStateActions.setFilters,
        tableStateActions.setSort,
        tableStateActions.setPaginator,
        tableStateActions.setAggregatedColumns,
        tableStateActions.applyView,
      ),
      // Wait for the reducer to update the store, then read the full
      // canonical snapshot.
      switchMap((action) =>
        this.store.select(selectIbKaiTableSnapshot(action.tableName)).pipe(
          take(1),
          filter((snapshot): snapshot is NonNullable<typeof snapshot> => snapshot != null),
          tap((snapshot) => {
            this.tableUrlService.writeState(action.tableName, snapshot);
          })
        )
      ),
    )
  }, {
    dispatch: false
  });
}
