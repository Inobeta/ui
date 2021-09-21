import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { RoutingModule } from './routing.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { IbTableExampleComponent } from 'src/app/examples/table-example/table-with-redux/table-example.component';
import { NavComponent } from './examples/nav/nav.component';
import { DynamicFormsExampleComponent } from './examples/dynamic-forms-example/dynamic-forms-example.component';
import { ActionReducerMap, ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import {localStorageSync} from 'ngrx-store-localstorage';
import { IbTableModule } from './inobeta-ui/ui/table/table.module';
import { IbDynamicFormsModule } from './inobeta-ui/ui/forms/forms.module';
import { IbBreadcrumbModule } from './inobeta-ui/ui/breadcrumb/breadcrumb.module';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { IbMaterialFormModule } from './inobeta-ui/ui/material-forms/material-form.module';
import { HttpExampleComponent } from './examples/http-example.component';
import { MyCounterComponent } from './examples/redux-example/my-counter.component';
import { IbHttpModule } from './inobeta-ui/http/http.module';
import { ICounterState, counterReducer } from './examples/redux-example/counter.reducer';
import { DialogExampleComponent } from './examples/dialog-example/dialog-example.component';
import { IbModalModule } from './inobeta-ui/ui/modal';
import { MyCustomTextboxComponent } from './examples/dynamic-forms-example/my-custom-textbox.model';
import { IbToastExampleComponent } from './examples/toast-example/toast-example.component';
import { IbToastModule } from './inobeta-ui/ui/toast/toast.module';
import { IbTableExampleNoReduxComponent } from './examples/table-example/table-without-redux/table-example.component';
import { ITableFiltersState } from './inobeta-ui/ui/table/redux/table.reducer';
import { ISessionState } from './inobeta-ui/http/auth/redux/session.reducer';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { IbTableStickyExampleComponent } from './examples/table-example/table-sticky/table-example.component';
import { EffectsModule } from '@ngrx/effects';
import { TableEffects } from './inobeta-ui/ui/table/store/effects/table.effects';
import { IbMainMenuModule } from './inobeta-ui/ui/main-menu/main-menu.module';

export interface IAppState {
  sessionState?: ISessionState;
  countState: ICounterState;
}

const reducers: ActionReducerMap<IAppState> = {
  countState: counterReducer
};

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({keys: ['sessionState'], rehydrate: true})(reducer);
}

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export const statusErrorMessages = { 404: 'Risorsa non trovata'};

@NgModule({
  declarations: [
    AppComponent,
    IbTableExampleComponent,
    NavComponent,
    DynamicFormsExampleComponent,
    HttpExampleComponent,
    MyCounterComponent,
    DialogExampleComponent,
    MyCustomTextboxComponent,
    IbToastExampleComponent,
    IbTableExampleNoReduxComponent,
    IbTableStickyExampleComponent
  ],
  imports: [
    CommonModule,
    IbTableModule,
    IbMainMenuModule,
    IbBreadcrumbModule,
    IbDynamicFormsModule,
    IbMaterialFormModule,
    RoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    IbHttpModule,
    IbModalModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    IbToastModule,
    MatMenuModule,
    MatRippleModule,
    MatButtonModule,
    MatGridListModule,
    StoreModule.forRoot(reducers, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
      },
    }),
    EffectsModule.forRoot([TableEffects]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      features: {
        pause: true,
        lock: true,
        persist: true
      },
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

    {provide: 'HttpMode', useValue: 'NORMAL'},
    {provide: 'ibHttpToastOnStatusCode', useValue: statusErrorMessages },
    {provide: 'ibHttpToastErrorCode', useValue: 'code' },
    {provide: 'ibHttpUrlExcludedFromLoader', useValue: [{url: 'http://repubblica.it', method: 'GET'}] }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
