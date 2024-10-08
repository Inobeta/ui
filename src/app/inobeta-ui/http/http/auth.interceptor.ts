import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Inject, Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, throwError } from "rxjs";
import { catchError, mergeMap, take } from "rxjs/operators";
import { IbToastNotification } from "../../ui/toast/toast.service";
import { IbLoginService } from "../auth/login.service";
import { IbAPITokens, IbAuthTypes, IbSession } from "../auth/session.model";
import { ibSelectActiveSession } from "../store/session/selectors";

@Injectable({ providedIn: "root" })
export class IbAuthInterceptor implements HttpInterceptor {
  store = inject(Store);
  session$: Observable<IbSession<IbAPITokens> | null> = this.store.select(
    ibSelectActiveSession<IbAPITokens>()
  );

  constructor(
    private ibToast: IbToastNotification,
    private login: IbLoginService<IbAPITokens>,
    @Inject("ibHttpEnableInterceptors")
    public ibHttpEnableInterceptors: boolean,
    @Inject("ibHttpAPILoginUrl") public ibHttpAPILoginUrl: string,
    @Inject("ibHttpToastOnLoginFailure")
    public ibHttpToastOnLoginFailure: string,
    @Inject("ibHttpAuthType") public ibHttpAuthType: IbAuthTypes
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let authString = "";

    let authReq = request.clone({
      headers: request.headers.set("x-requested-with", "XMLHttpRequest"),
    });
    switch (this.ibHttpAuthType) {
      case IbAuthTypes.JWT:
        authString = "Bearer ";
        break;
      case IbAuthTypes.BASIC_AUTH:
        authString = "Basic ";
        break;
    }
    return this.session$.pipe(
      take(1),
      mergeMap((session) => {
        if (session?.valid && session?.serverData?.accessToken) {
          authString += session.serverData.accessToken;
          authReq = request.clone({
            headers: request.headers.set("Authorization", authString),
          });
        }
        return next.handle(authReq);
      }),
      catchError((err) => {
        if (!this.ibHttpEnableInterceptors) {
          return throwError(() => err);
        }
        if (request.url !== this.ibHttpAPILoginUrl && err.status === 401) {
          this.ibToast.open(this.ibHttpToastOnLoginFailure, "warning");
          this.login.logout(false);
        }
        return throwError(() => err);
      })
    );
  }
}
