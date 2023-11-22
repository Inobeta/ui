import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, withLatestFrom } from 'rxjs/operators';
import { IbHttpClientService } from '../../http/http-client.service';
import { ibLoaderActions } from './actions';
import { ibSelectIsHttpLoading } from './selectors';

@Injectable({providedIn: 'root'})
export class LoaderEffects {

  /**
   * @deprecated this is a legacy fallback
   */
  incLoading$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(ibLoaderActions.incLoading),
      withLatestFrom(ibSelectIsHttpLoading),
      map((showLoading) => this.httpLegagy.showLoading = showLoading)
    )
  }, {
    dispatch: false
  });

  /**
   * @deprecated this is a legacy fallback
   */
  decLoading$ = createEffect(():any => {
    return this.actions$.pipe(
      ofType(ibLoaderActions.decLoading),
      withLatestFrom(ibSelectIsHttpLoading),
      map((showLoading) => this.httpLegagy.showLoading = showLoading)
    )
  }, {
    dispatch: false
  });
  constructor(
    private actions$: Actions,
    private httpLegagy: IbHttpClientService
    ) { }

}
