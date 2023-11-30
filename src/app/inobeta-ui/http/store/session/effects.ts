import { Inject, Injectable, Optional } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ibAuthActions } from "./actions";
import { combineLatest, of } from "rxjs";
import { mergeMap, delay, switchMap, catchError, withLatestFrom, map, filter } from "rxjs/operators";
import { IbAPITokens, IbSession } from "../../auth/session.model";
import { Store } from "@ngrx/store";
import { ibSelectAccessTokenExp, ibSelectActiveSession } from "./selectors";
import { IbLoginService } from "../../auth/login.service";
import { IbAuthService } from "../../auth/auth.service";
import { IbStorageTypes } from "src/app/inobeta-ui/storage/storage.service";

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
      ).pipe(
        switchMap(() => [ibAuthActions.refreshCycle()])
      )
  });



  refreshCycle$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ibAuthActions.refreshCycle),
      withLatestFrom(combineLatest([
        this.store.select(ibSelectActiveSession<IbAPITokens>()),
        this.store.select(ibSelectAccessTokenExp)
      ])),
      filter(([, [session]]) => session !== null),
      mergeMap(([, [session, exp]]) => of(session).pipe(
        delay(exp)
      )),
      mergeMap((session) => this.login.refresh(session.serverData.refreshToken)),
    ).pipe(
      switchMap((serverData: IbAPITokens) => {
        const activeSession =  new IbSession<IbAPITokens>();
        activeSession.user.password = '';
        activeSession.valid = true;
        activeSession.serverData = serverData;
        return [
          ibAuthActions.login({activeSession})
        ]
      }),
      catchError(() => [ibAuthActions.logout()]),
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
