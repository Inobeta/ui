import {Inject, Injectable, Optional} from '@angular/core';
import {IbSession} from './session.model';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';

@Injectable()
export class IbAuthService {
  activeSession: IbSession = null;
  sessionStorageKey = '';

  constructor(private srvLocalStorage: LocalStorageService,
              private svcCookie: CookiesStorageService,
              @Inject('SessionStorageKey') @Optional() public SessionStorageKey?: string
  ) {
    this.sessionStorageKey = SessionStorageKey || '';
    this.activeSession = this.svcCookie.get(`userData-${this.sessionStorageKey}`) as IbSession;
    if (!this.activeSession) {
      this.activeSession = this.srvLocalStorage.get(`userData-${this.sessionStorageKey}`) as IbSession;
    }
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
