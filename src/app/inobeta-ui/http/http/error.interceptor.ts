import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IbToastNotification } from '../../ui/toast/toast.service';

@Injectable({providedIn: 'root'})
export class IbErrorInterceptor implements HttpInterceptor {
  constructor(
    private ibToast: IbToastNotification,
    @Inject('ibHttpEnableInterceptors') @Optional() public ibHttpEnableInterceptors?: boolean,
    @Inject('ibHttpToastOnGenericFailure') @Optional() public ibHttpToastOnGenericFailure?: string,
    @Inject('ibHttpToastErrorField') @Optional() public ibHttpToastErrorField?: string,
    @Inject('ibHttpToastOnStatusCode') @Optional() public ibHttpToastOnStatusCode?: any,
  ) {
    this.ibHttpEnableInterceptors = this.ibHttpEnableInterceptors === null ? true : false;
    this.ibHttpToastOnGenericFailure = this.ibHttpToastOnGenericFailure || 'shared.ibHttp.genericFailure';
    this.ibHttpToastOnStatusCode = this.ibHttpToastOnStatusCode || {};
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (!this.ibHttpEnableInterceptors) {
        return throwError(err);
      }
      if ([200, 401].indexOf(err.status) === -1) {
        let errorMessage = this.ibHttpToastOnGenericFailure;
        if (this.ibHttpToastErrorField && err.error && err.error[this.ibHttpToastErrorField]) {
          errorMessage = err.error[this.ibHttpToastErrorField];
        }
        if (this.ibHttpToastOnStatusCode[err.status]) {
          errorMessage = this.ibHttpToastOnStatusCode[err.status];
        }
        this.ibToast.open(errorMessage, 'error');
      }
      return throwError(err);
    }));
  }
}
