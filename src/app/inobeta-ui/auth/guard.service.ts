import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class Guard implements CanActivate {
  constructor(
    private authService: AuthService,
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
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router) {}

  canActivate(): boolean {
    const isAuth = this.authService.activeSession != null;
    if (isAuth) { this.router.navigateByUrl('/dashboard'); }
    return !isAuth;
  }
}
