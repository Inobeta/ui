import { Injectable, inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { map, withLatestFrom } from "rxjs/operators";
import { IbHttpClientService } from "../../http/http-client.service";
import { ibLoaderActions } from "./actions";
import { ibSelectIsHttpLoading } from "./selectors";

@Injectable({ providedIn: "root" })
export class IbLoaderEffects {
  private actions$ = inject(Actions);

  /**
   * @deprecated this is a legacy fallback
   */
  incLoading$ = createEffect(
    (): any => {
      return this.actions$.pipe(
        ofType(ibLoaderActions.incLoading),
        withLatestFrom(ibSelectIsHttpLoading),
        map((showLoading) => (this.httpLegacy.showLoading = showLoading))
      );
    },
    {
      dispatch: false,
    }
  );

  /**
   * @deprecated this is a legacy fallback
   */
  decLoading$ = createEffect(
    (): any => {
      return this.actions$.pipe(
        ofType(ibLoaderActions.decLoading),
        withLatestFrom(ibSelectIsHttpLoading),
        map((showLoading) => (this.httpLegacy.showLoading = showLoading))
      );
    },
    {
      dispatch: false,
    }
  );
  constructor(private httpLegacy: IbHttpClientService) {}
}
