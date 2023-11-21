import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IbToastNotification } from '../../ui/toast/toast.service';
import { IbAuthService } from '../auth/auth.service';
import { IbLoginService } from '../auth/login.service';
import { IbAPITokens, IbAuthTypes } from '../auth/session.model';

@Injectable({providedIn: 'root'})
export class IbAuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: IbAuthService<IbAPITokens>,
    private ibToast: IbToastNotification,
    private login: IbLoginService<IbAPITokens>,
    @Inject('ibHttpEnableInterceptors') @Optional() public ibHttpEnableInterceptors?: boolean,
    @Inject('ibHttpAPILoginUrl') @Optional() public ibHttpAPILoginUrl?: string,
    @Inject('ibHttpToastOnLoginFailure') @Optional() public ibHttpToastOnLoginFailure?: string,
    @Inject('ibHttpAuthType') @Optional() public ibHttpAuthType?: IbAuthTypes,
  ) {
    this.ibHttpEnableInterceptors = this.ibHttpEnableInterceptors === null ? true : false;
    this.ibHttpAPILoginUrl = this.ibHttpAPILoginUrl || '/api/login';
    this.ibHttpToastOnLoginFailure = this.ibHttpToastOnLoginFailure || 'shared.ibHttp.authFailure';
  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authString = ''

    let authReq = request.clone({
      headers: request.headers
        .set('Content-Type', 'application/json')
        .set('x-requested-with', 'XMLHttpRequest')
    })
    switch(this.ibHttpAuthType){
      case IbAuthTypes.JWT: authString = 'Bearer '; break;
      case IbAuthTypes.BASIC_AUTH: authString = 'Basic '; break;
    }
    if(this.auth.activeSession?.valid && this.auth.activeSession?.serverData?.accessToken){
      authString += this.auth.activeSession.serverData.accessToken
      authReq = request.clone({
        headers: request.headers
          .set('Authorization', authString)
      })
    }
    return next.handle(authReq).pipe(catchError(err => {
      if (!this.ibHttpEnableInterceptors) {
        return throwError(err);
      }
      if (request.url !== this.ibHttpAPILoginUrl && err.status === 401) {
        this.ibToast.open(this.ibHttpToastOnLoginFailure, 'warning');
        this.login.logout(false);
      }
      return throwError(err);
    }));


  }

}
