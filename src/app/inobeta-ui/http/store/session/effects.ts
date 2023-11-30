import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { ibAuthActions } from "./actions";
import { of } from "rxjs";
import { mergeMap, delay, switchMap, catchError } from "rxjs/operators";
import { IbSession } from "../../auth/session.model";

@Injectable({providedIn: 'root'})
export class IbSessionEffects{
  refreshCycle$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ibAuthActions.refreshCycle),
      mergeMap((action) => of(action).pipe(
        delay(this.csmsAuth.getRefreshTimer())
      )),
      mergeMap(() => this.csmsAuth.tokenRefresh()),
      mergeMap((session: ILoginData) => [this.csmsAuth.storeFreshSession(session)]),
    ).pipe(
      switchMap((newSession: IbSession<ILoginData>) => [
        authActions.resetSession({newSession})
      ]),
      catchError(() => [ibAuthActions.logout()]),
    )
  });

  constructor(
    private actions$: Actions
  ) { }


}
