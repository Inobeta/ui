import { Inject, Injectable, Optional } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { IbAuthService } from './auth.service';

@Injectable({providedIn: 'root'})
export class IbAuthGuard implements CanActivate {
  constructor(
    private authService: IbAuthService,
    private router: Router,
    @Inject('ibHttpGUILoginUrl') @Optional() public ibHttpGUILoginUrl?: string,
  ) {
    this.ibHttpGUILoginUrl = this.ibHttpGUILoginUrl || '/login';
  }

  canActivate(routeData): boolean {
    const isAuth = this.authService.activeSession != null;
    if (!isAuth) { this.router.navigateByUrl(this.ibHttpGUILoginUrl); }
    return isAuth;
  }
}

@Injectable({providedIn: 'root'})
export class IbLoginGuard implements CanActivate {
  public path = '';
  constructor(
    private authService: IbAuthService,
    private router: Router,
    @Inject('ibHttpGUIDashboardUrl') @Optional() public ibHttpGUIDashboardUrl?: string,
    ) {
      this.ibHttpGUIDashboardUrl = this.ibHttpGUIDashboardUrl || '/dashboard';
    }

  canActivate(): boolean {
    const isAuth = this.authService.activeSession != null;
    if (isAuth) {
      if (this.path !== '') {
        this.router.navigateByUrl(this.path);
      } else {
        this.router.navigateByUrl(this.ibHttpGUIDashboardUrl);
      }
    }
    return !isAuth;
  }
}
