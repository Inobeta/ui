import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { delay, finalize, map, tap } from 'rxjs/operators';
import { ibLoaderActions } from '../store/loader/actions';
import { IbHttpRequestDefinition } from './http-client.service';

@Injectable({providedIn: 'root'})
export class IbLoaderInterceptor implements HttpInterceptor {
  constructor(
    private store: Store,
    @Inject('ibHttpEnableInterceptors') @Optional() public ibHttpEnableInterceptors?: boolean,
    @Inject('ibHttpUrlExcludedFromLoader') @Optional() public ibHttpUrlExcludedFromLoader?: IbHttpRequestDefinition[],
  ) {
    this.ibHttpEnableInterceptors = this.ibHttpEnableInterceptors === null;
    this.ibHttpUrlExcludedFromLoader = this.ibHttpUrlExcludedFromLoader || [];
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.ibHttpEnableInterceptors) {
      return next.handle(request)
    }

    if(this.ibHttpUrlExcludedFromLoader
      .find(u => u.url.toUpperCase() === request.url.toUpperCase() && u.method.toUpperCase() === request.method.toUpperCase()) ) {
      this.store.dispatch(ibLoaderActions.skipShow());
    }
    this.store.dispatch(ibLoaderActions.incLoading());
    return next.handle(request).pipe(delay(1000), finalize(() => this.store.dispatch(ibLoaderActions.decLoading()) ));
  }
}
