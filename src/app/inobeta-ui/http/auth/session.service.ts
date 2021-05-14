import {Injectable} from '@angular/core';
import {IbAuthTypes, IbSession, IbUserLogin} from './session.model';
import {IbHttpClientService} from '../http/http-client.service';
import {IbAuthService} from './auth.service';
import {catchError, map} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {Store} from '@ngrx/store';
import * as SessionActions from './redux/session.actions';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material';
import { Inject } from '@angular/core';
import { Optional } from '@angular/core';

const loginUrl = '/api/auth/login';

@Injectable()
export class IbSessionService {
  private authType = null /*IbAuthTypes.BASIC_AUTH*/;

  constructor(
    private srvAuth: IbAuthService,
    private h: IbHttpClientService,
    private store: Store<any>,
    private srvRouter: Router,
    private snackBar: MatSnackBar,
    @Inject('ibHttpGUILoginUrl') @Optional() public ibHttpGUILoginUrl?: string
    ) {
      this.ibHttpGUILoginUrl = this.ibHttpGUILoginUrl || '/login';
    }

  public setAuthtype(type: IbAuthTypes) {
    this.authType = type;
    this.h.setAuthtype(type);
  }

  public login( u: IbUserLogin, postUrl = null, fieldToSave = null ) {

    if (u) {
      this.srvAuth.activeSession = new IbSession();
      if (this.authType === IbAuthTypes.BASIC_AUTH) {
        this.srvAuth.activeSession.authToken = window.btoa(u.username + ':' + u.password);
      }
      this.srvAuth.activeSession.valid = false;
      this.srvAuth.activeSession.user = u;
    }
    const data = u || {};
    return this.h.post((postUrl) ? postUrl : loginUrl, data)
      .pipe(
        map( x => {
          if (this.authType === IbAuthTypes.JWT) {
            this.srvAuth.activeSession.authToken = x['token'];
          }
          this.srvAuth.activeSession.user.password = '';
          this.srvAuth.activeSession.valid = true;
          this.srvAuth.activeSession.userData = fieldToSave ? x[fieldToSave] : x;
          console.log('IbSession login ok', this.srvAuth.activeSession);
          if (this.srvAuth.activeSession.user.rememberMe) {
            this.srvAuth.storeSession();
          } else {
            this.srvAuth.cookieSession();
          }
          this.store.dispatch(SessionActions.login({activeSession: this.srvAuth.activeSession}));
          return x;
        }),
        catchError( err => {
          this.srvAuth.activeSession = null;
          console.log('IbSession login error', this.srvAuth.activeSession, err);
          return throwError(err);
        } )
      );
  }

  public logout(makeSnack: boolean = true) {
    this.srvAuth.activeSession = null;
    this.store.dispatch(SessionActions.logout());
    this.srvAuth.logout();
    this.srvRouter.navigateByUrl(this.ibHttpGUILoginUrl);
    if (makeSnack) {
      this.snackBar.open('Logout completed', null, {duration: 2000});
    }
  }
}
