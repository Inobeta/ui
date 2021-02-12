import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HttpClientService } from './http/httpclient.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ResponseHandlerService } from './http/responseHandler.service';
import { AuthService } from './auth/auth.service';
import { SessionService } from './auth/session.service';
import { LocalStorageService, CookiesStorageService } from 'ngx-store';
import { Guard, LoginGuard } from './auth/guard.service';
import { SpinnerLoadingComponent } from './http/spinnerLoading.component';


const entryComponents = []

const components = [
  ...entryComponents,
  SpinnerLoadingComponent
]

const services = [
  HttpClientService,
  ResponseHandlerService,
  AuthService,
  SessionService,
  LocalStorageService,
  CookiesStorageService,
  Guard,
  LoginGuard,
]


@NgModule({
  imports: [
    TranslateModule.forChild({
      extend: true
    }),
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    ...components
  ],
  declarations: [
    ...components
  ],
  providers: [
    ...services
  ],
  entryComponents: [
    ...entryComponents
  ]
})
export class IbHttpModule { }
