import { Injector, ModuleWithProviders, NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IbHttpClientService } from './http/http-client.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IbResponseHandlerService } from './http/response-handler.service';
import { IbAuthService } from './auth/auth.service';
import { IbSessionService } from './auth/session.service';
import { IbAuthGuard, IbLoginGuard, IbRoleGuard } from './auth/guard.service';
import { IbSpinnerLoadingComponent } from './http/spinner-loading.component';
import { ReactiveFormsModule } from '@angular/forms';
import { IbToastModule } from '../ui/toast/toast.module';
import { IbAuthInterceptor } from './http/auth.interceptor';
import { IbErrorInterceptor } from './http/error.interceptor';
import { IbStorageModule } from '../storage/storage.module';
import { IbLoginService } from './auth/login.service';
import { IbLoaderInterceptor } from './http/loader.interceptor';
import { IbLoadingDirective } from './http/loading-skeleton.directive';
import { IbLoadingSkeletonRectComponent } from './http/loading-skeleton.component';
import { IbLoadingSkeletonContainerComponent } from './http/loading-skeleton-container.component';
import { IbRoleCheckDirective } from './http/role-check.directive';



const components = [
  IbSpinnerLoadingComponent,
  IbLoadingDirective,
  IbLoadingSkeletonContainerComponent,
  IbLoadingSkeletonRectComponent
];
@NgModule({
  imports: [
    TranslateModule.forChild({
      extend: true
    }),
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    IbToastModule,
    IbStorageModule,
    IbRoleCheckDirective
  ],
  exports: [
    ...components,
    IbRoleCheckDirective
  ],
  declarations: [
    ...components
  ],
  providers: [
    IbHttpClientService,
    IbLoginService,
    IbResponseHandlerService,
    { provide: HTTP_INTERCEPTORS, useClass: IbAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: IbErrorInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: IbLoaderInterceptor, multi: true },

  ]
})

export class IbHttpModule {
  static injector: Injector = null;

  constructor(injector: Injector) {
    IbHttpModule.injector = injector;
  }

  static forRoot(): ModuleWithProviders<IbHttpModule> {
    return {
      ngModule: IbHttpModule,
      providers: [
        IbAuthService,
        IbLoginService,
        IbSessionService,
        IbAuthGuard,
        IbLoginGuard,
        IbRoleGuard
      ]
    };
  }
}
