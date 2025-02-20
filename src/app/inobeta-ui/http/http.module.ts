import { importProvidersFrom, Injector, makeEnvironmentProviders, ModuleWithProviders, NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { IbAuthGuard, IbLoginGuard, IbRoleGuard } from "./auth/guard.service";
import { IbSpinnerLoadingComponent } from "./http/spinner-loading.component";
import { ReactiveFormsModule } from "@angular/forms";
import { IbToastModule } from "../ui/toast/toast.module";
import { IbAuthInterceptor, IbAuthInterceptorLegacy } from "./http/auth.interceptor";
import { IbErrorInterceptor } from "./http/error.interceptor";
import { IbStorageModule } from "../storage/storage.module";
import { IbLoginService } from "./auth/login.service";
import { IbLoaderInterceptor } from "./http/loader.interceptor";
import { IbRoleCheckDirective } from "./http/role-check.directive";
import { IbStorageTypes } from "../storage/storage.service";
import { IbAuthTypes } from "./auth/session.model";
import {
  IB_HTTP_AUTH_TYPE,
  IB_HTTP_URL_EXCLUDED_FROM_LOADER,
  IB_HTTP_GUI_DASHBOARD_URL,
  IB_HTTP_API_LOGIN_URL,
  IB_HTTP_GUI_LOGIN_URL,
  IB_HTTP_API_REFRESH_URL,
  IB_HTTP_SESSION_STORAGE_TYPE,
  IB_HTTP_JWT_CLAIMS_FIELD,
  IB_HTTP_JWT_ROLES_FIELD,
  IB_HTTP_ENABLE_INTERCEPTORS,
  IB_HTTP_TOAST_ON_LOGIN_FAILURE,
  IB_HTTP_TOAST_ON_GENERIC_FAILURE,
  IB_HTTP_TOAST_ON_STATUS_CODE,
  IB_HTTP_TOAST_ERROR_CODE,
  IB_HTTP_TOAST_ERROR_FIELD,
} from "./tokens";
const components = [
  IbSpinnerLoadingComponent
];
/**
 * @deprecated Use `provideIbHttp()` instead of `IbHttpModule`.
 */
@NgModule({ exports: [...components, IbRoleCheckDirective],
    declarations: [...components], imports: [TranslateModule.forChild({
            extend: true,
        }),
        CommonModule,
        ReactiveFormsModule,
        IbToastModule,
        IbStorageModule,
        IbRoleCheckDirective],
        providers: [
        IbLoginService,
        { provide: "ibHttpAuthType", useValue: IbAuthTypes.JWT },
        {
            provide: "ibHttpUrlExcludedFromLoader",
            useValue: [],
        },
        { provide: "ibHttpGUIDashboardUrl", useValue: "/home" },
        {
            provide: "ibHttpAPILoginUrl",
            useValue: "/api/auth/login",
        },
        { provide: "ibHttpGUILoginUrl", useValue: "/login" },
        {
            provide: "ibHttpAPIRefreshUrl",
            useValue: "/api/auth/refresh",
        },
        {
            provide: "ibHttpSessionStorageType",
            useValue: IbStorageTypes.LOCALSTORAGE,
        },
        {
            provide: "ibHttpJWTClaimsField",
            useValue: "https://hasura.io/jwt/claims",
        },
        { provide: "ibHttpJWTRolesField", useValue: "x-hasura-allowed-roles" },
        { provide: "ibHttpEnableInterceptors", useValue: true },
        {
            provide: "ibHttpToastOnLoginFailure",
            useValue: "shared.ibHttp.authFailure",
        },
        {
            provide: "ibHttpToastOnGenericFailure",
            useValue: "shared.ibHttp.genericFailure",
        },
        {
            provide: "ibHttpToastOnStatusCode",
            useValue: {},
        },
        {
            provide: "ibHttpToastErrorCode",
            useValue: null,
        },
        {
            provide: "ibHttpToastErrorField",
            useValue: null,
        },
        { provide: HTTP_INTERCEPTORS, useClass: IbAuthInterceptorLegacy, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: IbErrorInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: IbLoaderInterceptor, multi: true },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class IbHttpModule {
  static injector: Injector = null;

  constructor(injector: Injector) {
    IbHttpModule.injector = injector;
  }

  static forRoot(): ModuleWithProviders<IbHttpModule> {
    return {
      ngModule: IbHttpModule,
      providers: [
        IbLoginService,
        IbAuthGuard,
        IbLoginGuard,
        IbRoleGuard,
      ],
    };
  }
}


export function provideIbHttp() {
  return makeEnvironmentProviders([
    // Servizi
    IbLoginService,
    IbAuthGuard,
    IbLoginGuard,
    IbRoleGuard,

    { provide: IB_HTTP_AUTH_TYPE, useValue: IbAuthTypes.JWT },
    { provide: IB_HTTP_URL_EXCLUDED_FROM_LOADER, useValue: [] },
    { provide: IB_HTTP_GUI_DASHBOARD_URL, useValue: "/home" },
    { provide: IB_HTTP_API_LOGIN_URL, useValue: "/api/auth/login" },
    { provide: IB_HTTP_GUI_LOGIN_URL, useValue: "/login" },
    { provide: IB_HTTP_API_REFRESH_URL, useValue: "/api/auth/refresh" },
    { provide: IB_HTTP_SESSION_STORAGE_TYPE, useValue: IbStorageTypes.LOCALSTORAGE },
    { provide: IB_HTTP_JWT_CLAIMS_FIELD, useValue: "https://hasura.io/jwt/claims" },
    { provide: IB_HTTP_JWT_ROLES_FIELD, useValue: "x-hasura-allowed-roles" },
    { provide: IB_HTTP_ENABLE_INTERCEPTORS, useValue: true },
    { provide: IB_HTTP_TOAST_ON_LOGIN_FAILURE, useValue: "shared.ibHttp.authFailure" },
    { provide: IB_HTTP_TOAST_ON_GENERIC_FAILURE, useValue: "shared.ibHttp.genericFailure" },
    { provide: IB_HTTP_TOAST_ON_STATUS_CODE, useValue: {} },
    { provide: IB_HTTP_TOAST_ERROR_CODE, useValue: null },
    { provide: IB_HTTP_TOAST_ERROR_FIELD, useValue: null },

    // Interceptors
    { provide: HTTP_INTERCEPTORS, useClass: IbErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: IbLoaderInterceptor, multi: true },

    // HTTP Client con intereptors
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(
      [
        IbToastModule,
        IbStorageModule,
        CommonModule,
        ReactiveFormsModule,
      ]
    )
  ]);
}

