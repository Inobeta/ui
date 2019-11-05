import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {AuthService} from './auth.service';
/*import {IAppState} from "../../app.module";
import {NgRedux} from "@angular-redux/store";
import {MenuActions} from "../../layout/menu/menu.reducer";*/

@Injectable()
export class Guard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    // private ngRedux: NgRedux<IAppState>,
    // private actions: MenuActions
  ) {}

  canActivate(routeData): boolean {
    console.log('check path', routeData);
    const isAuth = this.authService.activeSession != null;
    console.log('this.authService.activeSession', this.authService.activeSession);
    if (!isAuth) { this.router.navigateByUrl('login'); }
    /* if(!routeData.data.skipMenuStateChange){
       this.ngRedux.dispatch(this.actions.pageChange(`/${routeData.routeConfig.path}`, MenuActions.PAGE_CHANGE))
     }*/
    return isAuth;
  }
} /* istanbul ignore next */


@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router) {}

  canActivate(): boolean {
    const isAuth = this.authService.activeSession != null;
    if (isAuth) { this.router.navigateByUrl('dashboard'); }
    return !isAuth;
  }
} /* istanbul ignore next */
