import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { Inject, Injectable, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, throwError } from "rxjs";
import { catchError, mergeMap, take } from "rxjs/operators";
import { IbToastNotification } from "../../ui/toast/toast.service";
import { IbLoginService } from "../auth/login.service";
import { IbAPITokens, IbAuthTypes, IbSession } from "../auth/session.model";
import { ibSelectActiveSession } from "../store/";
import { IB_HTTP_API_LOGIN_URL, IB_HTTP_AUTH_TYPE, IB_HTTP_ENABLE_INTERCEPTORS, IB_HTTP_TOAST_ON_LOGIN_FAILURE } from "../tokens";

@Injectable({ providedIn: "root" })
export class IbAuthInterceptorLegacy implements HttpInterceptor {
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



export const IbAuthInterceptor: HttpInterceptorFn = (req, next) => {
  // Dependency Injection con `inject()`
  const store = inject(Store);
  const ibToast = inject(IbToastNotification);
  const login = inject<IbLoginService<IbAPITokens>>(IbLoginService);

  // Recupero dei valori dai provider
  const ibHttpEnableInterceptors = inject(IB_HTTP_ENABLE_INTERCEPTORS);
  const ibHttpAPILoginUrl = inject(IB_HTTP_API_LOGIN_URL);
  const ibHttpToastOnLoginFailure = inject(IB_HTTP_TOAST_ON_LOGIN_FAILURE);
  const ibHttpAuthType = inject(IB_HTTP_AUTH_TYPE);

  // Ottenere il valore dello stato direttamente con `selectSignal()`
  const session = store.selectSignal(ibSelectActiveSession<IbAPITokens>());

  let authString = "";
  let authReq = req.clone({
    headers: req.headers.set("x-requested-with", "XMLHttpRequest"),
  });

  switch (ibHttpAuthType) {
    case IbAuthTypes.JWT:
      authString = "Bearer ";
      break;
    case IbAuthTypes.BASIC_AUTH:
      authString = "Basic ";
      break;
  }

  // Recupero diretto dei dati della sessione
  const sessionData = session();
  if (sessionData?.valid && sessionData?.serverData?.accessToken) {
    authString += sessionData.serverData.accessToken;
    authReq = req.clone({
      headers: req.headers.set("Authorization", authString),
    });
  }

  return next(authReq).pipe(
    catchError((err) => {
      if (!ibHttpEnableInterceptors) {
        return throwError(() => err);
      }
      if (req.url !== ibHttpAPILoginUrl && err.status === 401) {
        ibToast.open(ibHttpToastOnLoginFailure, "warning");
        login.logout(false);
      }
      return throwError(() => err);
    })
  );
};
