import { Inject, Injectable, Optional } from '@angular/core';
import {  ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { IbAPITokens, IbSession } from './session.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ibSelectActiveSession } from '../store/session/selectors';
import { map, take } from 'rxjs/operators';
import { IbLoginService } from './login.service';

@Injectable({providedIn: 'root'})
export class IbAuthGuard implements CanActivate {
  session$: Observable<IbSession<IbAPITokens> | null> = this.store.select(ibSelectActiveSession<IbAPITokens>())

  constructor(
    private router: Router,
    private store: Store,
    @Inject('ibHttpGUILoginUrl') @Optional() public ibHttpGUILoginUrl?: string,
  ) {
    this.ibHttpGUILoginUrl = this.ibHttpGUILoginUrl || '/login';
  }

  canActivate() {
    return this.session$.pipe(
      take(1),
      map(session => {
        const isAuth = session != null;
        if (!isAuth) { this.router.navigateByUrl(this.ibHttpGUILoginUrl); }
        return isAuth;
      })
    )
  }
}

@Injectable({providedIn: 'root'})
export class IbLoginGuard implements CanActivate {
  session$: Observable<IbSession<IbAPITokens> | null> = this.store.select(ibSelectActiveSession<IbAPITokens>())

  public path = '';
  constructor(
    private router: Router,
    private store: Store,
    @Inject('ibHttpGUIDashboardUrl') @Optional() public ibHttpGUIDashboardUrl?: string,
    ) {
      this.ibHttpGUIDashboardUrl = this.ibHttpGUIDashboardUrl || '/dashboard';
    }

  canActivate() {
    return this.session$.pipe(
      take(1),
      map(session => {
        const isAuth = session != null;
        if (isAuth) {
          if (this.path !== '') {
            this.router.navigateByUrl(this.path);
          } else {
            this.router.navigateByUrl(this.ibHttpGUIDashboardUrl);
          }
        }
        return !isAuth;
      })
    )
  }
}


@Injectable({providedIn: 'root'})
export class IbRoleGuard implements CanActivate {

  constructor(
    private router: Router,
    private login: IbLoginService<IbAPITokens>,
    @Inject('ibHttpGUIDashboardUrl') @Optional() public ibHttpGUIDashboardUrl?: string,
    ) {
      this.ibHttpGUIDashboardUrl = this.ibHttpGUIDashboardUrl || '/dashboard';
    }

  canActivate(route: ActivatedRouteSnapshot) {
    return this.login.hasRoles(route.data.roles).pipe(
      take(1),
      map(hasRole => {
        if (!hasRole) { this.router.navigateByUrl(this.ibHttpGUIDashboardUrl); }
        return hasRole;
      })
    )
  }
}
