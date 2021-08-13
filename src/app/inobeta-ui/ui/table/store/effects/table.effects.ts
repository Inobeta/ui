import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';

import { concatMap } from 'rxjs/operators';
import { Observable, EMPTY } from 'rxjs';

import * as TableActions from '../actions/table.actions';
import { IbStorageService } from 'src/app/inobeta-ui/storage';
import { IbtableState } from '../reducers/table.reducer';
import { Store } from '@ngrx/store';
import { selectTableState } from '../selectors/table.selectors';
import { IbAuthService } from 'src/app/inobeta-ui/http';

const STORAGE_NAME = 'ib-table-store';
const ANON_USER = 'ib-anon';

@Injectable()
export class TableEffects {

  onSetTotalRowCell$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TableActions.ibTableActionSetTotalRowCell),
      /** An EMPTY observable only emits completion. Replace with your own observable API request */
      concatMap(() => EMPTY as Observable<{ type: string }>)
    );
  });

  onSaveConfig$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(TableActions.ibTableActionSaveConfig),
      concatLatestFrom(_ => this.store.select(selectTableState)),
      concatMap(([action, state]) => {
        let user = ANON_USER;
        if (this.auth.isLoggedIn()) {
          user = this.auth.activeSession.user.username;
        }
        const key = `${STORAGE_NAME}/${user}`;
        const stored = this.storage.get(key) || {};
        stored[action.name] = state;
        this.storage.set(key, stored);
        return EMPTY as Observable<{ type: string }>
      })
    )
  })

  constructor(
    private actions$: Actions,
    private store: Store<IbtableState>,
    private storage: IbStorageService,
    private auth: IbAuthService) { }

}
