import {Inject, Injectable, Optional} from '@angular/core';
import { IbStorageService, IbStorageTypes } from '../../storage/storage.service';
import {IbAPITokens, IbSession} from './session.model';

@Injectable({
  providedIn: 'root',
})
export class IbAuthService<T extends IbAPITokens | IbAPITokens> {
  activeSession: IbSession<T> = null;
  sessionStorageKey = '';

  constructor(private storage: IbStorageService,
              /**
               * @deprecated Rename SessionStorageKey to ibSessionStorageKey please
               */
              @Inject('SessionStorageKey') @Optional() public SessionStorageKey?: string,
              @Inject('ibSessionStorageKey') @Optional() public ibSessionStorageKey?: string
  ) {
    if(SessionStorageKey){
      console.warn('[deprecated] Rename SessionStorageKey to ibSessionStorageKey please');
    }
    this.sessionStorageKey = ibSessionStorageKey || SessionStorageKey || '';
    this.activeSession = this.storage.get(`userData-${this.sessionStorageKey}`, IbStorageTypes.COOKIESTORAGE) as IbSession<T>;
    if (!this.activeSession) {
      this.activeSession = this.storage.get(`userData-${this.sessionStorageKey}`, IbStorageTypes.LOCALSTORAGE) as IbSession<T>;
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

}
