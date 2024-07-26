import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { jwtDecode } from "jwt-decode";
import { Observable, throwError } from "rxjs";
import { catchError, filter, map } from "rxjs/operators";
import { ibAuthActions } from "../store/session/actions";
import { ibSelectActiveSession } from "../store/session/selectors";
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
    private store: Store,
    private srvRouter: Router,
    private snackBar: MatSnackBar,
    /** Login page path */
    @Inject("ibHttpGUILoginUrl")
    public ibHttpGUILoginUrl,
    /** API login endpoint */
    @Inject("ibHttpAPILoginUrl")
    public ibHttpAPILoginUrl,
    /** Authorizazion type. Either bearer token (JWT) or basic */
    @Inject("ibHttpAuthType")
    public ibHttpAuthType,
    /** Where to storage the user's access token */
    @Inject("ibHttpSessionStorageType")
    public ibHttpSessionStorageType,
    /** Refresh access token API endpoint */
    @Inject("ibHttpAPIRefreshUrl")
    public ibHttpAPIRefreshUrl,
    /** Property name of additional data or claims within the JWT token */
    @Inject("ibHttpJWTClaimsField")
    public ibHttpJWTClaimsField,
    /** Property name of the user roles within the JWT claims field */
    @Inject("ibHttpJWTRolesField")
    public ibHttpJWTRolesField
  ) {}

  /**
   * Attempts a login to the server by contacting the endpoint provided by the token {@link ibHttpAPILoginUrl}
   */
  public login(user: IbUserLogin) {
    const activeSession = new IbSession<T>();

    if (user) {
      if (this.ibHttpAuthType === IbAuthTypes.BASIC_AUTH) {
        activeSession.serverData.accessToken = window.btoa(
          user.email + ":" + user.password
        );
      }
      activeSession.valid = false;
      activeSession.user = {
        ...user,
        password: "",
      };
    }

    return this.httpClient.post<T>(this.ibHttpAPILoginUrl, user).pipe(
      map((token) => {
        activeSession.valid = true;
        activeSession.serverData = token;
        this.store.dispatch(
          ibAuthActions.login({ activeSession: activeSession })
        );
        return token;
      }),
      catchError((err) => throwError(() => err))
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
    this.store.dispatch(ibAuthActions.logout());
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
