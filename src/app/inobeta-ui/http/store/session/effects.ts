import { Inject, Injectable, Optional, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { combineLatest, of } from "rxjs";
import {
  delay,
  map,
  mergeMap,
  switchMap,
  takeUntil,
  withLatestFrom,
} from "rxjs/operators";
import { IbStorageTypes } from "../../../storage/storage.service";
import { IbAuthService } from "../../auth/auth.service";
import { IbLoginService } from "../../auth/login.service";
import { IbAPITokens, IbSession } from "../../auth/session.model";
import { ibAuthActions } from "./actions";
import { ibSelectAccessTokenExp, ibSelectActiveSession } from "./selectors";

@Injectable({ providedIn: "root" })
export class IbSessionEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  login$ = createEffect(
    () => {
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
      );
    },
    { dispatch: false }
  );

  refreshCycle$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ibAuthActions.refreshCycle),
      withLatestFrom(
        combineLatest([
          this.store.select(ibSelectActiveSession<IbAPITokens>()),
          this.store.select(ibSelectAccessTokenExp),
        ])
      ),
      mergeMap(([, [session, exp]]) =>
        of(session).pipe(
          delay(exp),
          takeUntil(this.actions$.pipe(ofType(ibAuthActions.logout)))
        )
      ),
      mergeMap((session) =>
        session?.serverData?.refreshToken
          ? this.login.refresh(session?.serverData?.refreshToken)
          : of(null)
      ),
      switchMap((serverData: IbAPITokens | null) => {
        if (serverData === null) {
          return [ibAuthActions.logout()];
        }
        const activeSession = new IbSession<IbAPITokens>();
        activeSession.valid = true;
        activeSession.serverData = serverData;
        return [
          ibAuthActions.login({ activeSession }),
          ibAuthActions.refreshCycle(),
        ];
      })
    );
  });

  constructor(
    private login: IbLoginService<IbAPITokens>,
    private authLegacy: IbAuthService<IbAPITokens>,
    @Inject("ibHttpSessionStorageType")
    public ibHttpSessionStorageType: IbStorageTypes
  ) {}
}
