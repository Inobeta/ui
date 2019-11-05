import {Injectable} from '@angular/core';
import {AuthTypes, Session, UserLogin} from './session.model';
import {HttpClientService} from '../http/httpclient.service';
import {AuthService} from './auth.service';
import {catchError, map} from 'rxjs/operators';
import {throwError} from 'rxjs';
import {NgRedux} from '@angular-redux/store';
import {IAppState} from '../../app.module';
import {StateActions} from '../redux/tools';
import {SessionActions} from './session.reducer';

const loginUrl = '/api/auth/login';

@Injectable()
export class SessionService {
  private authType = null /*AuthTypes.BASIC_AUTH*/;

  constructor(
    private srvAuth: AuthService,
    private h: HttpClientService,
    private ngRedux: NgRedux<IAppState>,
    private actions: StateActions
  ) {
  }

  public setAuthtype(type: AuthTypes) {
    this.authType = type;
    this.h.setAuthtype(type);
  }

  public login( u: UserLogin, postUrl = null ) {
    this.srvAuth.activeSession = new Session();
    if (this.authType === AuthTypes.BASIC_AUTH) {
      this.srvAuth.activeSession.authToken = window.btoa(u.username + ':' + u.password);
    }
    this.srvAuth.activeSession.valid = false;
    this.srvAuth.activeSession.user = u;
    return this.h.post((postUrl) ? postUrl : loginUrl, u)
      .pipe(
        map( x => {
          if (this.authType === AuthTypes.JWT) {
            this.srvAuth.activeSession.authToken = x['token'];
          }
          this.srvAuth.activeSession.user.password = '';
          this.srvAuth.activeSession.valid = true;
          this.srvAuth.activeSession.userData = x;
          console.log('Session login ok', this.srvAuth.activeSession);
          if (u.rememberMe) {
            this.srvAuth.storeSession();
          } else {
            this.srvAuth.cookieSession();
          }
          // this.ngRedux.dispatch(this.actions.stateChange(this.srvAuth.activeSession, \.LOGIN));
          return x;
        }),
        catchError( err => {
          this.srvAuth.activeSession = null;
          console.log('Session login error', this.srvAuth.activeSession, err);
          return throwError(err);
        } )
      );
  }

}
