import { Inject, Injectable, Optional } from "@angular/core";
import { Actions, createEffect, ofType, OnInitEffects } from "@ngrx/effects";
import { Action, Store } from "@ngrx/store";
import { distinctUntilChanged, map, switchMap, tap } from "rxjs/operators";
import * as HydrationActions from "./actions";

@Injectable()
export class HydrationEffects implements OnInitEffects {
  ibHydrate$ = createEffect(() =>
    this.action$.pipe(
      ofType(HydrationActions.ibHydrate),
      map(() => {
        //TODO: put here SQLite storage save when we will move to app
        const storageValue = localStorage.getItem(this.ibSessionStorageKey);
        if (storageValue) {
          try {
            const state = JSON.parse(storageValue);
            console.log('hydrating from local storage', state)
            return HydrationActions.ibHydrateSuccess({ state });
          } catch {
            localStorage.removeItem(this.ibSessionStorageKey);
          }
        }
        return HydrationActions.ibHydrateFailure();
      })
    )
  );

  serialize$ = createEffect(
    () =>
      this.action$.pipe(
        ofType(
          HydrationActions.ibHydrateSuccess,
          HydrationActions.ibHydrateFailure
        ),
        switchMap(() => this.store),
        distinctUntilChanged(),
        tap(state => {
          const storageValue = localStorage.getItem(this.ibSessionStorageKey);
          let oldState = {}
          try {
            oldState = JSON.parse(storageValue);
          } catch {
            console.log('no previous state to resume')
          }
          const toSerialize = {
            ...oldState,
            ...state
          }
          for(let k in toSerialize){
            if(this.ibReduxPersistKeys?.indexOf(k) < 0){
              delete toSerialize[k]
            }
          }
          return localStorage.setItem(this.ibSessionStorageKey, JSON.stringify(toSerialize))
        })
      ),
    { dispatch: false }
  );

  constructor(
    private action$: Actions,
    private store: Store<any>,
    @Inject('ibSessionStorageKey') @Optional() public ibSessionStorageKey?: string,
    @Inject('ibReduxPersistKeys') @Optional() public ibReduxPersistKeys?: string[],
    ) {}

  ngrxOnInitEffects(): Action {
    return HydrationActions.ibHydrate();
  }
}
