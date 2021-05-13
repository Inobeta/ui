import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IbToastNotification } from '../../ui/toast/toast.service';

@Injectable({providedIn: 'root'})
export class IbAuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private ibToast: IbToastNotification,
    @Inject('ibHttpEnableInterceptors') @Optional() public ibHttpEnableInterceptors?: boolean,
    @Inject('ibHttpAPILoginUrl') @Optional() public ibHttpAPILoginUrl?: string,
    @Inject('ibHttpGUILoginUrl') @Optional() public ibHttpGUILoginUrl?: string,
    @Inject('ibHttpToastOnLoginFailure') @Optional() public ibHttpToastOnLoginFailure?: string,
  ) {
    this.ibHttpEnableInterceptors = this.ibHttpEnableInterceptors === null ? true : false;
    this.ibHttpAPILoginUrl = this.ibHttpAPILoginUrl || '/api/login';
    this.ibHttpGUILoginUrl = this.ibHttpGUILoginUrl || '/login';
    this.ibHttpToastOnLoginFailure = this.ibHttpToastOnLoginFailure || 'shared.ibHttp.authFailure';
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      if (!this.ibHttpEnableInterceptors) {
        return throwError(err);
      }
      if (request.url !== this.ibHttpAPILoginUrl && err.status === 401) {
        this.router.navigateByUrl(this.ibHttpGUILoginUrl);
        this.ibToast.open(this.ibHttpToastOnLoginFailure, 'warning');
      }
      return throwError(err);
    }));


  }

}
