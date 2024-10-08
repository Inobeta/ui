import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType, OnInitEffects } from "@ngrx/effects";
import { Action, Store } from "@ngrx/store";
import { distinctUntilChanged, switchMap, tap } from "rxjs/operators";
import * as HydrationActions from "./actions";

@Injectable()
export class HydrationEffects implements OnInitEffects {
  static ibSessionStorageKey: string;
  static ibReduxPersistKeys: string[];

  private actions$ = inject(Actions);
  private store = inject(Store);

  serialize$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(HydrationActions.ibHydrate),
        switchMap(() => this.store),
        distinctUntilChanged(),
        tap((state) => {
          saveState(
            HydrationEffects.ibSessionStorageKey,
            HydrationEffects.ibReduxPersistKeys,
            state
          );
          return state;
        })
      ),
    { dispatch: false }
  );

  ngrxOnInitEffects(): Action {
    return HydrationActions.ibHydrate();
  }
}

function saveState(
  ibSessionStorageKey: string,
  ibReduxPersistKeys: string[],
  state: any
) {
  const storageValue = localStorage.getItem(ibSessionStorageKey);
  let oldState = {};
  try {
    oldState = JSON.parse(storageValue);
  } catch {
    console.log("no previous state to resume");
  }
  const toSerialize = {
    ...oldState,
    ...state,
  };
  for (let k in toSerialize) {
    if (ibReduxPersistKeys?.indexOf(k) < 0) {
      delete toSerialize[k];
    }
  }
  return localStorage.setItem(ibSessionStorageKey, JSON.stringify(toSerialize));
}
