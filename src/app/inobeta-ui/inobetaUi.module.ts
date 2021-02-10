import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CommonModule, DatePipe} from '@angular/common';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {TableComponent} from './ui/table/table.component';
import {HttpClientService} from './http/httpclient.service';
import {ResponseHandlerService} from './http/responseHandler.service';
import {Guard, LoginGuard} from './auth/guard.service';
import {AuthService} from './auth/auth.service';
import {SessionService} from './auth/session.service';
import {SpinnerLoadingComponent} from './http/spinnerLoading.component';
import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ModalMessageComponent} from './ui/modal/modalMessage.component';
import {LoginComponent} from './pages/login.component';
import {UploaderComponent} from './ui/uploader/uploader.component';
import {CookiesStorageService, LocalStorageService} from 'ngx-store';
import {RouterModule} from '@angular/router';
import {TableInterfaceComponent} from './ui/table/table.const';
import {StoreModule} from '@ngrx/store';
import * as fromSession from '../../app/inobeta-ui/auth/redux/session.reducer';
import * as fromTableFilters from '../../app/inobeta-ui/ui/table/redux/table.reducer';
import {TableSeachComponent} from './ui/table/components/table-seach.component';
import {TableExportCsvComponent, TableExportDialogComponent} from './ui/table/components/table-export-csv.component';
import {TableMenuActionsComponent} from './ui/table/components/table-menu-actions.component';
import {TableAddComponent} from './ui/table/components/table-add.component';
import {TableFilterResetComponent} from './ui/table/components/table-filter-reset.component';
import {TablePaginatorComponent} from './ui/table/components/table-paginator.component';
import {TableHeaderPopupComponent} from './ui/table/components/tableHeaderPopup.component';
import { CustomMaterialModule } from './material.module';
import { TableHeaderComponent } from './ui/table/components/table-header/table-header.component';
import { TableRowsComponent } from './ui/table/components/table-rows/table-rows.component';
import { DynamicFormsModule } from './forms/forms.module';
import { MaterialFormControlComponent } from './ui/forms/material-form-control/material-form-control.component';
import { MaterialFormComponent } from './ui/forms/material-form/material-form.component';
import { BreadcrumbModule } from './ui/breadcrumb/breadcrumb.module';
import { MaterialBreadcrumbComponent } from './ui/breadcrumb/material-breadcrumb/material-breadcrumb.component';

registerLocaleData(localeIt, 'it');

export const components = [
  TableComponent,
  TableInterfaceComponent,
  SpinnerLoadingComponent,
  ModalMessageComponent,
  LoginComponent,
  UploaderComponent,
  TableSeachComponent,
  TableExportCsvComponent,
  TableMenuActionsComponent,
  TableAddComponent,
  TableFilterResetComponent,
  TablePaginatorComponent,
  TableHeaderPopupComponent
];

export const services = [
  HttpClientService,
  ResponseHandlerService,
  Guard,
  LoginGuard,
  AuthService,
  SessionService,
  CookiesStorageService,
  DatePipe,
  LocalStorageService,
  TranslateService
];

export const imports = [
  CommonModule,
  RouterModule,
  HttpClientModule,
  CustomMaterialModule,
  FlexLayoutModule,
  FormsModule,
  ReactiveFormsModule,
  StoreModule.forRoot({
    sessionState: fromSession.sessionReducer,
    tableFiltersState: fromTableFilters.tableFiltersReducer
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
    ...components,
    TableHeaderComponent,
    TableRowsComponent,
    MaterialFormComponent,
    MaterialFormControlComponent,
    TableExportDialogComponent,
    //MaterialBreadcrumbComponent
  ],
  imports: [
    ...imports,
    DynamicFormsModule,
    BreadcrumbModule
  ],
  exports: [
    ...components,
    TableHeaderComponent,
    TableRowsComponent,
    TranslateModule,
    FlexLayoutModule,
    RouterModule,
    DynamicFormsModule,
    MaterialFormComponent,
    MaterialFormControlComponent,
    BreadcrumbModule,
    MaterialBreadcrumbComponent,
  ],
  providers: [
    ...services
  ],
  entryComponents: [
    ModalMessageComponent,
    TableExportDialogComponent
  ]
})
export class InobetaUiModule {}
