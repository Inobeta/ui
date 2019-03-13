import { NgModule } from '@angular/core';

import { ModuleWithProviders} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CommonModule, DatePipe} from '@angular/common';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {CustomMaterialModule} from './material.module';
import {TableComponent} from './ui/table/table.component';
import {CardComponent} from './ui/card.component';
import {HttpClientService} from './http/httpclient.service';
import {ResponseHandlerService} from './http/responseHandler.service';
import {BoxComponent} from './ui/box.component';
import {Guard, LoginGuard} from './auth/guard.service';
import {AuthService} from './auth/auth.service';
import {SessionService} from './auth/session.service';
import {SpinnerLoadingComponent} from './http/spinnerLoading.component';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ModalMessageComponent} from './ui/modalMessage.component';
import {LoginComponent} from './pages/login.component';
import {IbTabsComponent} from './ui/ib-tabs/ib-tabs.component';
import {UploaderComponent} from './ui/uploader/uploader.component';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';
import {CustomPrimeNgModule} from './customPrimeNg.module';
import {CustomTranslateService} from './utils/customTranslate.service';
import {TablePrimeComponent} from './ui/table/tablePrime/tablePrime.component';
import {JsonFormatterService} from './utils/jsonFormatter.service';
import {StateActions} from './redux/tools';
import { RouterModule} from '@angular/router';
import {TableInterfaceComponent} from './ui/table/table.const';

registerLocaleData(localeIt, 'it');

export const components = [
  TableComponent,
  TableInterfaceComponent,
  CardComponent,
  BoxComponent,
  SpinnerLoadingComponent,
  ModalMessageComponent,
  LoginComponent,
  IbTabsComponent,
  UploaderComponent,
  TablePrimeComponent
];

export const services = [
  HttpClientService,
  ResponseHandlerService,
  Guard,
  LoginGuard,
  AuthService,
  SessionService,
  CookiesStorageService,
  CustomTranslateService,
  DatePipe,
  JsonFormatterService,
  StateActions,
  LocalStorageService
  // ToasterService,
];

export const imports = [
  CommonModule,
  CustomMaterialModule,
  CustomPrimeNgModule,
  FlexLayoutModule,
  HttpClientModule,
  FormsModule,
  ReactiveFormsModule, /*
  RouterModule.forChild([
    { path: '', component: LoginComponent, canActivate: [Guard] },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  ]),*/
  TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [HttpClient]
    }
  })
];

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    ...components
  ],
  imports: [
    ...imports
  ],
  exports: [
    ...components,
    CustomMaterialModule,
    CustomPrimeNgModule,
    TranslateModule,
    FlexLayoutModule,
    RouterModule
    // ToasterModule
  ],
  providers: [
    ...services
  ],
  entryComponents: [
    ModalMessageComponent
  ]
})
export class InobetaUiModule { }
