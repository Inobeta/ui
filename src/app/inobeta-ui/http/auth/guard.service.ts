import { Inject, Injectable, Optional, inject } from "@angular/core";
import { ActivatedRouteSnapshot, Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { ibSelectActiveSession } from "../store/session/selectors";
import { IbLoginService } from "./login.service";
import { IbAPITokens, IbSession } from "./session.model";

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
