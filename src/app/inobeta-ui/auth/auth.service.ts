import {Inject, Injectable, Optional} from '@angular/core';
import {Session} from './session.model';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';
import * as SessionActions from './redux/session.actions';
import {Store} from '@ngrx/store';

@Injectable()
export class AuthService {
  activeSession: Session = null;
  sessionStorageKey = '';

  constructor(private srvLocalStorage: LocalStorageService,
              private svcCookie: CookiesStorageService,
              private store: Store<any>,
              @Inject('SessionStorageKey') @Optional() public SessionStorageKey?: string
  ) {
    this.sessionStorageKey = SessionStorageKey || '';
    this.activeSession = this.svcCookie.get(`userData-${this.sessionStorageKey}`) as Session;
    if (!this.activeSession) {
      this.activeSession = this.srvLocalStorage.get(`userData-${this.sessionStorageKey}`) as Session;
    }
    /*
    if (!this.activeSession) {
      this.store.dispatch(SessionActions.logout());
    }*/
  }

  public storeSession() {
    this.activeSession.valid = true;
    this.srvLocalStorage.set(`userData-${this.sessionStorageKey}`, this.activeSession);
  }

  public cookieSession() {
    this.activeSession.valid = true;
    this.svcCookie.set(`userData-${this.sessionStorageKey}`, this.activeSession);
  }

  public logout() {
    this.srvLocalStorage.set(`userData-${this.sessionStorageKey}`, null);
    this.svcCookie.set(`userData-${this.sessionStorageKey}`, null);
  }

  public isLoggedIn() {
    return this.activeSession !== null;
  }

}
