import { Inject, Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IbAuthService } from './auth.service';
import { IbAPITokens, IbAuthTypes, IbSession, IbUserLogin } from './session.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, throwError } from 'rxjs';
import { map, catchError, filter } from 'rxjs/operators';
import { IbStorageTypes } from '../../storage';
import { ibAuthActions } from '../store/session/actions';
import { ibSelectActiveSession } from '../store/session/selectors';
import { jwtDecode } from 'jwt-decode';

@Injectable({providedIn: 'root'})
export class IbLoginService<T extends IbAPITokens | IbAPITokens > {
  constructor(
    private httpClient: HttpClient,
    private srvAuth: IbAuthService<T>, //@deprecated: this is a fallback that will be removed in next major
    private store: Store,
    private srvRouter: Router,
    private snackBar: MatSnackBar,
    @Inject('ibHttpGUILoginUrl') @Optional() public ibHttpGUILoginUrl?: string,
    @Inject('ibHttpAPILoginUrl') @Optional() public ibHttpAPILoginUrl?: string,
    @Inject('ibHttpAuthType') @Optional() public ibHttpAuthType?: IbAuthTypes,
    @Inject('ibHttpSessionStorageType') @Optional() public ibHttpSessionStorageType?: IbStorageTypes,
    @Inject('ibHttpAPIRefreshUrl') @Optional() public ibHttpAPIRefreshUrl?: string,
    @Inject('ibHttpJWTClaimsField') @Optional() public ibHttpJWTClaimsField?: string,
    @Inject('ibHttpJWTRolesField') @Optional() public ibHttpJWTRolesField?: string
    ) {
      this.ibHttpGUILoginUrl = this.ibHttpGUILoginUrl ?? '/login';
      this.ibHttpAPILoginUrl = this.ibHttpAPILoginUrl ?? '/api/auth/login';
      this.ibHttpAPIRefreshUrl = this.ibHttpAPIRefreshUrl ?? '/api/auth/refresh';
      this.ibHttpAuthType = this.ibHttpAuthType ?? IbAuthTypes.JWT;
      this.ibHttpSessionStorageType = this.ibHttpSessionStorageType ?? IbStorageTypes.LOCALSTORAGE;
      this.ibHttpJWTClaimsField = this.ibHttpJWTClaimsField ?? 'https://hasura.io/jwt/claims';
      this.ibHttpJWTRolesField = this.ibHttpJWTRolesField ?? 'x-hasura-allowed-roles';
    }

  public login( u: IbUserLogin ) {
    this.srvAuth.activeSession = null;
    const activeSession =  new IbSession<T>();
    if (u) {
      if (this.ibHttpAuthType === IbAuthTypes.BASIC_AUTH) {
        activeSession.serverData.accessToken = window.btoa(u.email + ':' + u.password);
      }
      activeSession.valid = false;
      activeSession.user = u;
    }
    return this.httpClient.post<T>(this.ibHttpAPILoginUrl, u)
      .pipe(
        map( x => {
          activeSession.user.password = '';
          activeSession.valid = true;
          activeSession.serverData = x;
          this.store.dispatch(ibAuthActions.login({activeSession: activeSession}));
          return x;
        }),
        catchError( err => {
          return throwError(err);
        } )
      );
  }

  public refresh(token: string){
    return this.httpClient.post<IbAPITokens>(this.ibHttpAPIRefreshUrl, {token})
  }

  public logout(makeSnack: boolean = true) {
    this.srvAuth.activeSession = null;
    this.store.dispatch(ibAuthActions.logout());
    this.srvAuth.logout();
    this.srvRouter.navigateByUrl(this.ibHttpGUILoginUrl);
    if (makeSnack) {
      this.snackBar.open('Logout completed', null, {duration: 2000});
    }
  }

  public hasRoles(roles: string[]): Observable<boolean>{
    return this.store.select(ibSelectActiveSession<IbAPITokens>())
            .pipe(
              filter(session => session?.serverData?.accessToken !== undefined),
              map(session => jwtDecode(session.serverData.accessToken)),
              map(decodedData => {
                const userRoles: string[] = decodedData?.[this.ibHttpJWTClaimsField]?.[this.ibHttpJWTRolesField] ?? []
                for(let r of roles){
                  if(userRoles.findIndex(ur => ur === r) >= 0){
                    return true;
                  }
                }
                return false
              })
            )
  }

}
