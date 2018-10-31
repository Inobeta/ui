import { Injectable } from '@angular/core';
import {Session, UserLogin} from './session.model';
import {HttpClientService} from '../http/httpclient.service';
import {AuthService} from './auth.service';
import {catchError, finalize, map, tap} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {NgRedux} from '@angular-redux/store';
import {IAppState} from '../../app.module';
import {StateActions} from '../redux/tools';
import {SessionActions} from './session.reducer';

const loginUrl = '/api/rezona-auth/login';

@Injectable()
export class SessionService {

  constructor(
    private srvAuth: AuthService,
    private h: HttpClientService,
    private ngRedux: NgRedux<IAppState>,
    private actions: StateActions
  ) {
  }


  public login( u: UserLogin, postUrl = null ) {
    this.srvAuth.activeSession = new Session();
    this.srvAuth.activeSession.authToken = window.btoa(u.username + ':' + u.password);
    this.srvAuth.activeSession.valid = false;
    this.srvAuth.activeSession.user = u;
    return this.h.post((postUrl) ? postUrl : loginUrl, u)
      .pipe(
        map( x => {
          this.srvAuth.activeSession.user.password = '';
          this.srvAuth.activeSession.valid = true;
          this.srvAuth.activeSession.userData = x;
          console.log('Session login ok', this.srvAuth.activeSession);
          if (u.rememberMe) {
            this.srvAuth.storeSession();
          } else {
            this.srvAuth.cookieSession();
          }
          this.ngRedux.dispatch(this.actions.stateChange(this.srvAuth.activeSession, SessionActions.LOGIN));
          return x;
        }),
        catchError( err => {
          this.srvAuth.activeSession = null;
          console.log('Session login error', this.srvAuth.activeSession, err);
          return throwError(err);
        } )
      );
  }

} /* istanbul ignore next */
