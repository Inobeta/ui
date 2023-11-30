import { Inject, Injectable, Optional } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ibAuthActions } from "./actions";
import { combineLatest, of } from "rxjs";
import { mergeMap, delay, switchMap, catchError, withLatestFrom, map, filter, takeUntil } from "rxjs/operators";
import { IbAPITokens, IbSession } from "../../auth/session.model";
import { Store } from "@ngrx/store";
import { ibSelectAccessTokenExp, ibSelectActiveSession } from "./selectors";
import { IbLoginService } from "../../auth/login.service";
import { IbAuthService } from "../../auth/auth.service";
import { IbStorageTypes } from "../../../storage/storage.service";

@Injectable({providedIn: 'root'})
export class IbSessionEffects{

  login$ = createEffect(() => {
    return this.actions$.pipe(
        ofType(ibAuthActions.login),
        map((action) => {
          this.authLegacy.activeSession = action.activeSession;
          if (this.ibHttpSessionStorageType === IbStorageTypes.LOCALSTORAGE) {
            this.authLegacy.storeSession();
          } else {
            this.authLegacy.cookieSession();
          }
        })
      )
  }, { dispatch: false});



  refreshCycle$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ibAuthActions.refreshCycle),
      withLatestFrom(combineLatest([
        this.store.select(ibSelectActiveSession<IbAPITokens>()),
        this.store.select(ibSelectAccessTokenExp)
      ])),
      mergeMap(([, [session, exp]]) => of(session).pipe(
        delay(exp),
        takeUntil(this.actions$.pipe(ofType(ibAuthActions.logout)))
      )),
      mergeMap((session) => session?.serverData?.refreshToken ? this.login.refresh(session?.serverData?.refreshToken) : of(null)),
      switchMap((serverData: IbAPITokens | null) => {
        if(serverData === null){
          return [
            ibAuthActions.logout()
          ]
        }
        const activeSession =  new IbSession<IbAPITokens>();
        activeSession.valid = true;
        activeSession.serverData = serverData;
        return [
          ibAuthActions.login({activeSession}),
          ibAuthActions.refreshCycle()
        ]
      })
    )
  });


  constructor(
    private actions$: Actions,
    private store: Store,
    private login: IbLoginService<IbAPITokens>,
    private authLegacy: IbAuthService<IbAPITokens>,
    @Inject('ibHttpSessionStorageType') @Optional() public ibHttpSessionStorageType?: IbStorageTypes,
  ) {
    this.ibHttpSessionStorageType = this.ibHttpSessionStorageType ?? IbStorageTypes.LOCALSTORAGE;
  }


}
