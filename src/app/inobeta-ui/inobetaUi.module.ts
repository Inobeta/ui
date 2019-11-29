import { NgModule } from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CommonModule, DatePipe} from '@angular/common';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {CustomMaterialModule} from './material.module';
import {TableComponent} from './ui/table/table.component';
import {CardComponent} from './ui/card/card.component';
import {HttpClientService} from './http/httpclient.service';
import {ResponseHandlerService} from './http/responseHandler.service';
import {BoxComponent} from './ui/box/box.component';
import {Guard, LoginGuard} from './auth/guard.service';
import {AuthService} from './auth/auth.service';
import {SessionService} from './auth/session.service';
import {SpinnerLoadingComponent} from './http/spinnerLoading.component';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ModalMessageComponent} from './ui/modal/modalMessage.component';
import {LoginComponent} from './pages/login.component';
import {IbTabsComponent} from './ui/ib-tabs/ib-tabs.component';
import {UploaderComponent} from './ui/uploader/uploader.component';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';
import {CustomTranslateService} from './utils/customTranslate.service';
import {JsonFormatterService} from './utils/jsonFormatter.service';
import { RouterModule} from '@angular/router';
import {TableInterfaceComponent} from './ui/table/table.const';
import {StoreModule} from '@ngrx/store';
import * as fromCounter from '../../examples/redux-example/counter.reducer';
import * as fromSession from '../../app/inobeta-ui/auth/redux/session.reducer';
import {IbTableExampleComponent} from '../../examples/ib-tableExample.component';
import {TableSeachComponent} from './ui/table/table-seach.component';
import {TableExportCsvComponent} from './ui/table/table-export-csv.component';
import {TableMenuActionsComponent} from './ui/table/table-menu-actions.component';
import {TableAddComponent} from './ui/table/table-add.component';
import {TableFilterResetComponent} from './ui/table/table-filter-reset.component';

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
  IbTableExampleComponent,
  TableSeachComponent,
  TableExportCsvComponent,
  TableMenuActionsComponent,
  TableAddComponent,
  TableFilterResetComponent
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
  LocalStorageService,
  TranslateService
];

export const imports = [
  CommonModule,
  CustomMaterialModule,
  FlexLayoutModule,
  HttpClientModule,
  FormsModule,
  ReactiveFormsModule,
  StoreModule.forRoot({
    countState: fromCounter.counterReducer,
    sessionState: fromSession.sessionReducer
  }),
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
    TranslateModule,
    FlexLayoutModule,
    RouterModule
  ],
  providers: [
    ...services
  ],
  entryComponents: [
    ModalMessageComponent
  ]
})
export class InobetaUiModule { }
