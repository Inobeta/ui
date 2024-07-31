import { Injector, ModuleWithProviders, NgModule } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { IbAuthGuard, IbLoginGuard, IbRoleGuard } from "./auth/guard.service";
import { IbSpinnerLoadingComponent } from "./http/spinner-loading.component";
import { ReactiveFormsModule } from "@angular/forms";
import { IbToastModule } from "../ui/toast/toast.module";
import { IbAuthInterceptor } from "./http/auth.interceptor";
import { IbErrorInterceptor } from "./http/error.interceptor";
import { IbStorageModule } from "../storage/storage.module";
import { IbLoginService } from "./auth/login.service";
import { IbLoaderInterceptor } from "./http/loader.interceptor";
import { IbLoadingDirective } from "./http/loading-skeleton.directive";
import { IbLoadingSkeletonRectComponent } from "./http/loading-skeleton.component";
import { IbLoadingSkeletonContainerComponent } from "./http/loading-skeleton-container.component";
import { IbRoleCheckDirective } from "./http/role-check.directive";
import { IbStorageTypes } from "../storage/storage.service";
import { IbAuthTypes } from "./auth/session.model";

const components = [
  IbSpinnerLoadingComponent,
  IbLoadingDirective,
  IbLoadingSkeletonContainerComponent,
  IbLoadingSkeletonRectComponent,
];
@NgModule({ exports: [...components, IbRoleCheckDirective],
    declarations: [...components], imports: [TranslateModule.forChild({
            extend: true,
        }),
        CommonModule,
        ReactiveFormsModule,
        IbToastModule,
        IbStorageModule,
        IbRoleCheckDirective], providers: [
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
        { provide: HTTP_INTERCEPTORS, useClass: IbAuthInterceptor, multi: true },
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
