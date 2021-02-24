import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IbHttpClientService } from './http/http-client.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { IbResponseHandlerService } from './http/response-handler.service';
import { IbAuthService } from './auth/auth.service';
import { IbSessionService } from './auth/session.service';
import { LocalStorageService, CookiesStorageService } from 'ngx-store';
import { IbAuthGuard, IbLoginGuard } from './auth/guard.service';
import { IbSpinnerLoadingComponent } from './http/spinner-loading.component';
import { IbLoginComponent } from './pages/login.component';
import { ReactiveFormsModule } from '@angular/forms';


const entryComponents = []

const components = [
  ...entryComponents,
  IbSpinnerLoadingComponent,
  IbLoginComponent
]

const services = [
  IbHttpClientService,
  IbResponseHandlerService,
  IbAuthService,
  IbSessionService,
  LocalStorageService,
  CookiesStorageService,
  IbAuthGuard,
  IbLoginGuard,
]


@NgModule({
  imports: [
    TranslateModule.forChild({
      extend: true
    }),
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule
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
