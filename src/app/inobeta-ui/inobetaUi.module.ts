import {NgModule} from '@angular/core';
import {FlexLayoutModule} from '@angular/flex-layout';
import {CommonModule, DatePipe} from '@angular/common';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {registerLocaleData} from '@angular/common';
import localeIt from '@angular/common/locales/it';
import {ModalMessageComponent} from './modules/ui/modal/modalMessage.component';
import {LoginComponent} from './_toRemove_pages/login.component';
import {UploaderComponent} from './modules/ui/uploader/uploader.component';
import {RouterModule} from '@angular/router';
import {StoreModule} from '@ngrx/store';
import * as fromSession from './modules/ibHttp/auth/redux/session.reducer';
import * as fromTableFilters from './modules/ui/table/redux/table.reducer';
import { DynamicFormsModule } from './modules/ui/forms/forms.module';
import { BreadcrumbModule } from './modules/ui/breadcrumb/breadcrumb.module';
import { MaterialBreadcrumbComponent } from './modules/ui/breadcrumb/material-breadcrumb/material-breadcrumb.component';
import { ReactiveFormsModule } from '@angular/forms';

registerLocaleData(localeIt, 'it');

export const components = [
  LoginComponent
];

export const services = [
];

export const imports = [
  CommonModule,
  RouterModule,
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
  ],
  imports: [
    ...imports,
    DynamicFormsModule,
    BreadcrumbModule
  ],
  exports: [
    ...components,
    TranslateModule,
    FlexLayoutModule,
    RouterModule,
    BreadcrumbModule,
    MaterialBreadcrumbComponent,
  ],
  providers: [
    ...services
  ],
  entryComponents: [
    ModalMessageComponent,
  ]
})
export class InobetaUiModule {}
