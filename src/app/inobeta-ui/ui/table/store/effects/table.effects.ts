import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';

import { concatMap } from 'rxjs/operators';
import { Observable, EMPTY } from 'rxjs';

import * as TableActions from '../actions/table.actions';
import { IbTableState } from '../reducers/table.reducer';
import { Store } from '@ngrx/store';
import { selectTableState } from '../selectors/table.selectors';
import { IbAuthService } from '../../../../http/auth/auth.service';
import { IbStorageService } from '../../../../storage/storage.service';
import { IbTableConfService } from '../../services/table-conf.service';

const STORAGE_NAME = 'ib-table-store';
const ANON_USER = 'ib-anon';

@Injectable({providedIn: 'root'})
export class TableEffects {


  onSaveConfig$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TableActions.ibTableActionSaveConfig),
      concatLatestFrom(_ => this.store.select(selectTableState)),
      concatMap(([action, state]) => {
        const config = state.instances.find(i => i.tableName === action.tableName)?.config;
        this.tableConf.saveConfig(action.tableName, action.options, config);
        return EMPTY as Observable<{ type: string }>;
      })
    );
  });


  onLoadConfig$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TableActions.ibTableActionLoadConfig),
      concatLatestFrom(_ => this.store.select(selectTableState)),
      concatMap(([action, state]) => {
        const config = this.tableConf.loadConfig(action.tableName, action.configName);
        this.store.dispatch(TableActions.ibTableActionSetConfig({config, tableName: action.tableName}));
        return EMPTY as Observable<{ type: string }>;
      })
    );
  });

  constructor(
    private actions$: Actions,
    private store: Store<IbTableState>,
    private tableConf: IbTableConfService,
    private storage: IbStorageService,
    private auth: IbAuthService) { }

}
