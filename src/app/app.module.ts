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
import { ISessionState, sessionReducer } from './inobeta-ui/auth/redux/session.reducer';
import { ITableFiltersState, tableFiltersReducer } from './inobeta-ui/ui/table/redux/table.reducer';
import { ActionReducerMap, ActionReducer, MetaReducer, StoreModule } from '@ngrx/store';
import {localStorageSync} from 'ngrx-store-localstorage';

export interface IAppState {
  sessionState: ISessionState;
  tableFiltersState: ITableFiltersState;
}

const reducers: ActionReducerMap<IAppState> = {
  sessionState: sessionReducer,
  tableFiltersState: tableFiltersReducer
};

export function localStorageSyncReducer(reducer: ActionReducer<any>): ActionReducer<any> {
  return localStorageSync({keys: ['sessionState', 'tableFiltersState'], rehydrate: true})(reducer);
}

const metaReducers: Array<MetaReducer<any, any>> = [localStorageSyncReducer];


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    IbTableExampleComponent,
    NavComponent,
    DynamicFormsExampleComponent,
  ],
  imports: [
    CommonModule,
    InobetaUiModule,
    CustomMaterialModule,
    RoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    StoreModule.forRoot(reducers, {metaReducers}),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    }),
  ],
  exports: [
    FlexLayoutModule
  ],
  providers: [
    {provide: 'HttpMode', useValue: 'MOBILE'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
