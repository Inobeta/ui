import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { IbAuthService } from './auth.service';

@Injectable()
export class IbAuthGuard implements CanActivate {
  constructor(
    private authService: IbAuthService,
    private router: Router,
  ) {}

  canActivate(routeData): boolean {
    console.log('check path', routeData);
    const isAuth = this.authService.activeSession != null;
    console.log('this.authService.activeSession', this.authService.activeSession);
    if (!isAuth) { this.router.navigateByUrl('/login'); }
    return isAuth;
  }
}

@Injectable()
export class IbLoginGuard implements CanActivate {
  public path = '';
  constructor(
    private authService: IbAuthService,
    private router: Router) {}

  canActivate(): boolean {
    const isAuth = this.authService.activeSession != null;
    if (isAuth) {
      if (this.path !== '') {
        this.router.navigateByUrl(this.path);
      } else {
        this.router.navigateByUrl('/dashboard');
      }
    }
    return !isAuth;
  }
}
