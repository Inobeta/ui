import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { delay, finalize } from "rxjs/operators";
import { ibLoaderActions } from "../store/loader/actions";

export interface IbHttpRequestDefinition {
  url: string;
  method: string;
}

@Injectable({ providedIn: "root" })
export class IbLoaderInterceptor implements HttpInterceptor {
  constructor(
    private store: Store,
    @Inject("ibHttpEnableInterceptors")
    public ibHttpEnableInterceptors: boolean,
    @Inject("ibHttpUrlExcludedFromLoader")
    public ibHttpUrlExcludedFromLoader: IbHttpRequestDefinition[]
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.ibHttpEnableInterceptors) {
      return next.handle(request);
    }

    if (
      this.ibHttpUrlExcludedFromLoader.find(
        (u) =>
          u.url.toUpperCase() === request.url.toUpperCase() &&
          u.method.toUpperCase() === request.method.toUpperCase()
      )
    ) {
      this.store.dispatch(ibLoaderActions.skipShow());
    }
    this.store.dispatch(
      ibLoaderActions.incLoading({
        url: request.url,
        method: request.method,
      })
    );
    return next.handle(request).pipe(
      delay(1000),
      finalize(() =>
        this.store.dispatch(
          ibLoaderActions.decLoading({
            url: request.url,
            method: request.method,
          })
        )
      )
    );
  }
}
