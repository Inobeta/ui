import {Injectable} from '@angular/core';
import {Session} from './session.model';
import {Router} from '@angular/router';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';

@Injectable()
export class AuthService {
  activeSession: Session = null;

  constructor(private srvLocalStorage: LocalStorageService,
              private srvRouter: Router,
              private svcCookie: CookiesStorageService) {
    this.activeSession = this.svcCookie.get('userData') as Session;
    if (!this.activeSession) {
      this.activeSession = this.srvLocalStorage.get('userData') as Session;
    }
    console.log(this.activeSession)
  }

  public storeSession() {
    this.activeSession.valid = true;
    this.srvLocalStorage.set('userData', this.activeSession);
  }

  public cookieSession() {
    this.activeSession.valid = true;
    this.svcCookie.set('userData', this.activeSession);
  }

  public logout() {
    this.activeSession = null;
    this.srvLocalStorage.set('userData', null);
    this.svcCookie.set('userData', null);
    this.srvRouter.navigate(['/login']);
  }

}

/* istanbul ignore next */
