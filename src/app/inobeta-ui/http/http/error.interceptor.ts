import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { IbToastNotification } from "../../ui/toast/toast.service";

@Injectable({ providedIn: "root" })
export class IbErrorInterceptor implements HttpInterceptor {
  constructor(
    private ibToast: IbToastNotification,
    private translate: TranslateService,
    @Inject("ibHttpEnableInterceptors")
    public ibHttpEnableInterceptors: boolean,
    @Inject("ibHttpToastOnGenericFailure")
    public ibHttpToastOnGenericFailure: string,
    @Inject("ibHttpToastErrorField") public ibHttpToastErrorField: string,
    @Inject("ibHttpToastOnStatusCode") public ibHttpToastOnStatusCode: any,
    @Inject("ibHttpToastErrorCode") public ibHttpToastErrorCode: string
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (!this.ibHttpEnableInterceptors) {
          return throwError(() => new Error(err));
        }
        if ([200, 401].indexOf(err.status) === -1) {
          let errorMessage = this.ibHttpToastOnGenericFailure;

          if (this.ibHttpToastOnStatusCode[err.status]) {
            errorMessage = this.ibHttpToastOnStatusCode[err.status];
          }

          if (
            this.ibHttpToastErrorField &&
            err.error &&
            err.error[this.ibHttpToastErrorField]
          ) {
            errorMessage = err.error[this.ibHttpToastErrorField];
          }

          if (
            this.ibHttpToastErrorCode &&
            err.error &&
            err.error[this.ibHttpToastErrorCode]
          ) {
            const codeError = `shared.ibHttp.error${
              err.error[this.ibHttpToastErrorCode]
            }`;
            const instant = this.translate.instant(codeError);
            if (
              instant !==
              `shared.ibHttp.error${err.error[this.ibHttpToastErrorCode]}`
            ) {
              errorMessage = instant;
            }
          }
          this.ibToast.open(errorMessage, "error");
        }
        return throwError(() => new Error(err));
      })
    );
  }
}
