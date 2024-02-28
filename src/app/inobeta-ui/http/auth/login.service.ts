import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, Optional } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { jwtDecode } from "jwt-decode";
import { Observable, throwError } from "rxjs";
import { catchError, filter, map } from "rxjs/operators";
import { IbStorageTypes } from "../../storage";
import { ibAuthActions } from "../store/session/actions";
import { ibSelectActiveSession } from "../store/session/selectors";
import { IbAuthService } from "./auth.service";
import {
  IbAPITokens,
  IbAuthTypes,
  IbSession,
  IbUserLogin,
} from "./session.model";

@Injectable({ providedIn: "root" })
export class IbLoginService<T extends IbAPITokens | IbAPITokens> {
  constructor(
    private httpClient: HttpClient,
    /**
     * @deprecated: this is a fallback that will be removed in next major
     */
    private srvAuth: IbAuthService<T>,
    private store: Store,
    private srvRouter: Router,
    private snackBar: MatSnackBar,
    /** Login page path */
    @Inject("ibHttpGUILoginUrl")
    @Optional()
    public ibHttpGUILoginUrl = "/login",
    /** API login endpoint */
    @Inject("ibHttpAPILoginUrl")
    @Optional()
    public ibHttpAPILoginUrl = "/api/auth/login",
    /** Authorizazion type. Either bearer token (JWT) or basic */
    @Inject("ibHttpAuthType")
    @Optional()
    public ibHttpAuthType = IbAuthTypes.JWT,
    /** Where to storage the user's access token */
    @Inject("ibHttpSessionStorageType")
    @Optional()
    public ibHttpSessionStorageType = IbStorageTypes.LOCALSTORAGE,
    /** Refresh access token API endpoint */
    @Inject("ibHttpAPIRefreshUrl")
    @Optional()
    public ibHttpAPIRefreshUrl = "/api/auth/refresh",
    /** Property name of additional data or claims within the JWT token */
    @Inject("ibHttpJWTClaimsField")
    @Optional()
    public ibHttpJWTClaimsField = "https://hasura.io/jwt/claims",
    /** Property name of the user roles within the JWT claims field */
    @Inject("ibHttpJWTRolesField")
    @Optional()
    public ibHttpJWTRolesField = "x-hasura-allowed-roles"
  ) {
    this.ibHttpGUILoginUrl = this.ibHttpGUILoginUrl ?? "/login";
    this.ibHttpAPILoginUrl = this.ibHttpAPILoginUrl ?? "/api/auth/login";
    this.ibHttpAPIRefreshUrl = this.ibHttpAPIRefreshUrl ?? "/api/auth/refresh";
    this.ibHttpAuthType = this.ibHttpAuthType ?? IbAuthTypes.JWT;
    this.ibHttpSessionStorageType =
      this.ibHttpSessionStorageType ?? IbStorageTypes.LOCALSTORAGE;
    this.ibHttpJWTClaimsField =
      this.ibHttpJWTClaimsField ?? "https://hasura.io/jwt/claims";
    this.ibHttpJWTRolesField =
      this.ibHttpJWTRolesField ?? "x-hasura-allowed-roles";
  }

  /**
   * Attempts a login to the server by contacting the endpoint provided by the token {@link ibHttpAPILoginUrl}
   */
  public login(u: IbUserLogin) {
    this.srvAuth.activeSession = null;
    const activeSession = new IbSession<T>();
    if (u) {
      if (this.ibHttpAuthType === IbAuthTypes.BASIC_AUTH) {
        activeSession.serverData.accessToken = window.btoa(
          u.email + ":" + u.password
        );
      }
      activeSession.valid = false;
      activeSession.user = u;
    }
    return this.httpClient.post<T>(this.ibHttpAPILoginUrl, u).pipe(
      map((x) => {
        activeSession.user.password = "";
        activeSession.valid = true;
        activeSession.serverData = x;
        this.store.dispatch(
          ibAuthActions.login({ activeSession: activeSession })
        );
        return x;
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  /**
   * Refresh a token by contacting the endpoint provided by the token {@link ibHttpAPIRefreshUrl}
   */
  public refresh(token: string) {
    return this.httpClient.post<IbAPITokens>(this.ibHttpAPIRefreshUrl, {
      token,
    });
  }

  /**
   * Logout the user, clear the session, and navigate back to {@link ibHttpGUILoginUrl}
   * @param makeSnack Whether to show a snackbar message when logging out
   */
  public logout(makeSnack: boolean = true) {
    this.srvAuth.activeSession = null;
    this.store.dispatch(ibAuthActions.logout());
    this.srvAuth.logout();
    this.srvRouter.navigateByUrl(this.ibHttpGUILoginUrl);
    if (makeSnack) {
      this.snackBar.open("Logout completed", null, { duration: 2000 });
    }
  }

  /**
   * Check whether the current user has at least one of the provided roles
   * @param roles List of roles
   * @returns true if the user has at least one of the provided roles
   */
  public hasRoles(roles: string[]): Observable<boolean> {
    return this.store.select(ibSelectActiveSession<IbAPITokens>()).pipe(
      filter((session) => session?.serverData?.accessToken !== undefined),
      map((session) => jwtDecode(session.serverData.accessToken)),
      map((decodedData) => {
        const userRoles: string[] =
          decodedData?.[this.ibHttpJWTClaimsField]?.[
            this.ibHttpJWTRolesField
          ] ?? [];
        for (let r of roles) {
          if (userRoles.findIndex((ur) => ur === r) >= 0) {
            return true;
          }
        }
        return false;
      })
    );
  }
}
