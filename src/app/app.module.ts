import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { InobetaUiModule } from './inobeta-ui/inobetaUi.module';
import { RoutingModule } from './routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { HomeComponent } from 'src/app/examples/home.component';
import { IbTableExampleComponent } from 'src/app/examples/table-example/ib-tableExample.component';
import { NavComponent } from './examples/nav/nav.component';
import { DynamicFormsExampleComponent } from './examples/dynamic-forms-example/dynamic-forms-example.component';
import { CustomMaterialModule } from './inobeta-ui/material.module';
import { ISessionState, sessionReducer } from './inobeta-ui/modules/ibHttp/auth/redux/session.reducer';
import { ITableFiltersState, tableFiltersReducer } from './inobeta-ui/modules/ui/table/redux/table.reducer';
import { ActionReducerMap, ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import {localStorageSync} from 'ngrx-store-localstorage';
import { TableModule } from './inobeta-ui/modules/ui/table/table.module';
import { DynamicFormsModule } from './inobeta-ui/modules/ui/forms/forms.module';
import { BreadcrumbModule } from './inobeta-ui/modules/ui/breadcrumb/breadcrumb.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material';
import { MaterialFormModule } from './inobeta-ui/modules/ui/material-forms/material-form.module';
import { HttpExampleComponent } from './examples/httpExample.component';
import { MyCounterComponent } from './examples/redux-example/my-counter.component';
import { IbHttpModule } from './inobeta-ui/modules/ibHttp/ibHttp.module';
import { ICounterState, counterReducer } from './examples/redux-example/counter.reducer';
import { DialogExampleComponent } from './examples/dialog-example/dialog-example.component';
import { IbModalModule } from './inobeta-ui/modules/ui/modal';

export interface IAppState {
  sessionState: ISessionState;
  tableFiltersState: ITableFiltersState;
  countState: ICounterState;
}

const reducers: ActionReducerMap<IAppState> = {
  sessionState: sessionReducer,
  tableFiltersState: tableFiltersReducer,
  countState: counterReducer
};

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({keys: ['sessionState', 'tableFiltersState'], rehydrate: true})(reducer);
}

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    IbTableExampleComponent,
    NavComponent,
    DynamicFormsExampleComponent,
    HttpExampleComponent,
    MyCounterComponent,
    DialogExampleComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    BreadcrumbModule,
    DynamicFormsModule,
    MaterialFormModule,
    RoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    IbHttpModule,
    IbModalModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),

    MatCardModule
  ],
  exports: [
    FlexLayoutModule
  ],
  providers: [
    {provide: 'HttpMode', useValue: 'NORMAL'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
