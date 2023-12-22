import { Injectable, inject } from "@angular/core";
import { Actions, concatLatestFrom, createEffect, ofType } from "@ngrx/effects";

import { EMPTY, Observable } from "rxjs";
import { concatMap } from "rxjs/operators";

import { Store } from "@ngrx/store";
import { IbTableConfService } from "../../services/table-conf.service";
import * as TableActions from "../actions/table.actions";
import { selectTableState } from "../selectors/table.selectors";

@Injectable({ providedIn: "root" })
export class TableEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  onSaveConfig$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TableActions.ibTableActionSaveConfig),
      concatLatestFrom((_) => this.store.select(selectTableState)),
      concatMap(([action, state]) => {
        const config = state.instances.find(
          (i) => i.tableName === action.tableName
        )?.config;
        this.tableConf.saveConfig(action.tableName, action.options, config);
        return EMPTY as Observable<{ type: string }>;
      })
    );
  });

  onLoadConfig$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TableActions.ibTableActionLoadConfig),
      concatLatestFrom((_) => this.store.select(selectTableState)),
      concatMap(([action, state]) => {
        const config = this.tableConf.loadConfig(
          action.tableName,
          action.configName
        );
        this.store.dispatch(
          TableActions.ibTableActionSetConfig({
            config,
            tableName: action.tableName,
          })
        );
        return EMPTY as Observable<{ type: string }>;
      })
    );
  });

  constructor(private tableConf: IbTableConfService) {}
}
