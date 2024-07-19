import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { tap } from "rxjs/operators";
import { urlStateActions } from "./actions";
import { IbTableUrlService } from "../../table-url.service";

@Injectable({providedIn: "root"})
export class UrlStateEffects {

  actions$ = inject(Actions);
  tableUrlService = inject(IbTableUrlService);
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
}
