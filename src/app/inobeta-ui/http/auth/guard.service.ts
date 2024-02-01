import { Inject, Injectable, Optional, inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { ibSelectActiveSession } from "../store/session/selectors";
import { IbLoginService } from "./login.service";
import { IbAPITokens, IbSession } from "./session.model";

/**
 * Guard routes based on user authentication.
 *
 * Usage:
 * - Include the `IbAuthGuard` in the `canActivate` route guard to protect routes.
 * - If the user is not authenticated, they will be redirected to the login page provided by the `ibHttpGUILoginUrl` token.
 *
 * Example:
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'dashboard',
 *     component: DashboardComponent,
 *     canActivate: [IbAuthGuard],
 *   },
 *   // ... other routes ...
 * ];
 * ```
 */
@Injectable({ providedIn: "root" })
export class IbAuthGuard {
  store = inject(Store);
  session$: Observable<IbSession<IbAPITokens> | null> = this.store.select(
    ibSelectActiveSession<IbAPITokens>()
  );

  constructor(
    private router: Router,
    @Inject("ibHttpGUILoginUrl") @Optional() public ibHttpGUILoginUrl?: string
  ) {
    this.ibHttpGUILoginUrl = this.ibHttpGUILoginUrl || "/login";
  }

  canActivate() {
    return this.session$.pipe(
      take(1),
      map((session) => {
        const isAuth = session != null;
        if (!isAuth) {
          this.router.navigateByUrl(this.ibHttpGUILoginUrl);
        }
        return isAuth;
      })
    );
  }
}

/**
 * Guard routes based on user login status.
 * The opposite of IbAuthGuard, the route will activate if a user is NOT authenticated
 *
 * Usage:
 * - Include the `IbLoginGuard` in the `canActivate` route guard to protect routes.
 * - If the user is authenticated, they will be redirected to a page provided by the `ibHttpGUIDashboardUrl` token
 *
 * Example:
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'login',
 *     component: LoginComponent,
 *     canActivate: [IbLoginGuard],
 *   },
 *   // ... other routes ...
 * ];
 * ```
 */
@Injectable({ providedIn: "root" })
export class IbLoginGuard {
  store = inject(Store);
  session$: Observable<IbSession<IbAPITokens> | null> = this.store.select(
    ibSelectActiveSession<IbAPITokens>()
  );

  public path = "";
  constructor(
    private router: Router,
    @Inject("ibHttpGUIDashboardUrl")
    @Optional()
    public ibHttpGUIDashboardUrl?: string
  ) {
    this.ibHttpGUIDashboardUrl = this.ibHttpGUIDashboardUrl || "/dashboard";
  }

  canActivate() {
    return this.session$.pipe(
      take(1),
      map((session) => {
        const isAuth = session != null;
        if (isAuth) {
          if (this.path !== "") {
            this.router.navigateByUrl(this.path);
          } else {
            this.router.navigateByUrl(this.ibHttpGUIDashboardUrl);
          }
        }
        return !isAuth;
      })
    );
  }
}

/**
 * Guard routes based on user roles.
 *
 * Usage:
 * - Include the `IbRoleGuard` in the `canActivate` route guard to protect routes based on user roles.
 * - Specify the required roles in the route's data property.
 * - If the user is not granted access, they will be redirected to a page provided by the `ibHttpGUIDashboardUrl` token
 *
 * Example:
 * ```typescript
 * const routes: Routes = [
 *   {
 *     path: 'admin',
 *     component: AdminComponent,
 *     canActivate: [IbRoleGuard],
 *     data: { roles: ['admin'] }
 *   },
 *   // ... other routes ...
 * ];
 * ```
 */
@Injectable({ providedIn: "root" })
export class IbRoleGuard {
  constructor(
    private router: Router,
    private login: IbLoginService<IbAPITokens>,
    @Inject("ibHttpGUIDashboardUrl")
    @Optional()
    public ibHttpGUIDashboardUrl?: string
  ) {
    this.ibHttpGUIDashboardUrl = this.ibHttpGUIDashboardUrl || "/dashboard";
  }

  canActivate(route: ActivatedRouteSnapshot) {
    return this.login.hasRoles(route.data.roles).pipe(
      take(1),
      map((hasRole) => {
        if (!hasRole) {
          this.router.navigateByUrl(this.ibHttpGUIDashboardUrl);
        }
        return hasRole;
      })
    );
  }
}
