import {Inject, Injectable, Optional} from '@angular/core';
import { IbStorageService, IbStorageTypes } from '../../storage/storage.service';
import {IbSession} from './session.model';

@Injectable()
export class IbAuthService {
  activeSession: IbSession = null;
  sessionStorageKey = '';

  constructor(private storage: IbStorageService,
              @Inject('SessionStorageKey') @Optional() public SessionStorageKey?: string
  ) {
    this.sessionStorageKey = SessionStorageKey || '';
    this.activeSession = this.storage.get(`userData-${this.sessionStorageKey}`, IbStorageTypes.COOKIESTORAGE) as IbSession;
    if (!this.activeSession) {
      this.activeSession = this.storage.get(`userData-${this.sessionStorageKey}`, IbStorageTypes.LOCALSTORAGE) as IbSession;
    }
  }

  public storeSession() {
    this.activeSession.valid = true;
    this.storage.set(`userData-${this.sessionStorageKey}`, this.activeSession, IbStorageTypes.LOCALSTORAGE);
  }

  public cookieSession() {
    this.activeSession.valid = true;
    this.storage.set(`userData-${this.sessionStorageKey}`, this.activeSession, IbStorageTypes.COOKIESTORAGE);
  }

  public logout() {
    this.storage.set(`userData-${this.sessionStorageKey}`, null, IbStorageTypes.LOCALSTORAGE);
    this.storage.set(`userData-${this.sessionStorageKey}`, null, IbStorageTypes.COOKIESTORAGE);
  }

  public isLoggedIn() {
    return this.activeSession !== null;
  }

  public haveAuthToken() {
    return this.activeSession.authToken !== null;
  }

}
