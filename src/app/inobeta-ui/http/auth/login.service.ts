import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IbAuthService } from './auth.service';
import { IbAPITokens, IbAuthTypes, IbSession, IbUserLogin } from './session.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { IbStorageTypes } from '../../storage';
import { ibAuthActions } from '../store/session/actions';

@Injectable({providedIn: 'root'})
export class IbLoginService<T extends IbAPITokens | IbAPITokens > {
  constructor(
    private httpClient: HttpClient,
    private srvAuth: IbAuthService<T>,
    private store: Store,
    private srvRouter: Router,
    private snackBar: MatSnackBar,
    @Inject('ibHttpGUILoginUrl') @Optional() public ibHttpGUILoginUrl?: string,
    @Inject('ibHttpAPILoginUrl') @Optional() public ibHttpAPILoginUrl?: string,
    @Inject('ibHttpAuthType') @Optional() public ibHttpAuthType?: IbAuthTypes,
    @Inject('ibHttpSessionStorageType') @Optional() public ibHttpSessionStorageType?: IbStorageTypes,
    ) {
      this.ibHttpGUILoginUrl = this.ibHttpGUILoginUrl ?? '/login';
      this.ibHttpAPILoginUrl = this.ibHttpAPILoginUrl ?? '/api/auth/login';
      this.ibHttpAuthType = this.ibHttpAuthType ?? IbAuthTypes.JWT;
      this.ibHttpSessionStorageType = this.ibHttpSessionStorageType ?? IbStorageTypes.LOCALSTORAGE;
    }

  public login( u: IbUserLogin ) {

    if (u) {
      this.srvAuth.activeSession = new IbSession<T>();
      if (this.ibHttpAuthType === IbAuthTypes.BASIC_AUTH) {
        this.srvAuth.activeSession.serverData.accessToken = window.btoa(u.email + ':' + u.password);
      }
      this.srvAuth.activeSession.valid = false;
      this.srvAuth.activeSession.user = u;
    }
    return this.httpClient.post<T>(this.ibHttpAPILoginUrl, u)
      .pipe(
        map( x => {
          this.srvAuth.activeSession.user.password = '';
          this.srvAuth.activeSession.valid = true;
          this.srvAuth.activeSession.serverData = x;
          if (this.ibHttpSessionStorageType === IbStorageTypes.LOCALSTORAGE) {
            this.srvAuth.storeSession();
          } else {
            this.srvAuth.cookieSession();
          }
          this.store.dispatch(ibAuthActions.login({activeSession: this.srvAuth.activeSession}));
          return x;
        }),
        catchError( err => {
          this.srvAuth.activeSession = null;
          return throwError(err);
        } )
      );
  }

  public logout(makeSnack: boolean = true) {
    this.srvAuth.activeSession = null;
    this.store.dispatch(ibAuthActions.logout());
    this.srvAuth.logout();
    this.srvRouter.navigateByUrl(this.ibHttpGUILoginUrl);
    if (makeSnack) {
      this.snackBar.open('Logout completed', null, {duration: 2000});
    }
  }

}
