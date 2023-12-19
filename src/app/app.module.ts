import { FlexLayoutModule } from "@Inobeta/flex-layout";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatRippleModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { EffectsModule } from "@ngrx/effects";
import { ActionReducerMap, StoreModule, combineReducers } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { environment } from "../environments/environment";
import { AppComponent } from "./app.component";
import { DialogExampleComponent } from "./examples/dialog-example/dialog-example.component";
import { DynamicFormsExampleComponent } from "./examples/dynamic-forms-example/dynamic-forms-example.component";
import { IbKaiTableActionColumnExamplePage } from "./examples/kai-table-example/kai-table-actions-example";
import { IbKaiTableApiExamplePage } from "./examples/kai-table-example/kai-table-api-example";
import { IbKaiTableExamplePage } from "./examples/kai-table-example/kai-table-example";
import { IbKaiTableFullExamplePage } from "./examples/kai-table-example/kai-table-full-example";
import { IbMainMenuExampleComponent } from "./examples/main-menu-example/main-menu-example.component";
import { MaterialFormArrayExampleComponent } from "./examples/material-form-array-example/form-array-example.component";
import { MaterialFormExampleComponent } from "./examples/material-form-example/material-form-example.component";
import { MyCustomTextboxComponent } from "./examples/material-form-example/my-custom-textbox.model";
import { MaterialFormGridExampleComponent } from "./examples/material-form-grid-example/material-form-grid-example.component";
import { NavComponent } from "./examples/nav/nav.component";
import {
  ICounterState,
  counterReducer,
} from "./examples/redux-example/counter.reducer";
import { MyCounterComponent } from "./examples/redux-example/my-counter.component";
import { IbToastExampleComponent } from "./examples/toast-example/toast-example.component";
import { IbHttpModule } from "./inobeta-ui/http/http.module";
import {
  IHttpStore,
  ibHttpEffects,
  ibHttpReducers,
} from "./inobeta-ui/http/store";
import { ibSetupHydration } from "./inobeta-ui/hydration";
import { IbTranslateModuleLoader } from "./inobeta-ui/translate/translate-loader.service";
import { IbBreadcrumbModule } from "./inobeta-ui/ui/breadcrumb/breadcrumb.module";
import { IbDataExportModule } from "./inobeta-ui/ui/data-export/data-export.module";
import { IbDynamicFormsModule } from "./inobeta-ui/ui/forms/forms.module";
import { IbFilterModule } from "./inobeta-ui/ui/kai-filter";
import {
  IbKaiTableModule,
  IbTableActionModule,
} from "./inobeta-ui/ui/kai-table";
import { IbMainMenuModule } from "./inobeta-ui/ui/main-menu/main-menu.module";
import { IbMaterialFormModule } from "./inobeta-ui/ui/material-forms/material-form.module";
import { IbModalModule } from "./inobeta-ui/ui/modal";
import { TableEffects } from "./inobeta-ui/ui/table/store/effects/table.effects";
import { IbTableModule } from "./inobeta-ui/ui/table/table.module";
import { IbToastModule } from "./inobeta-ui/ui/toast/toast.module";
import { IbViewModule } from "./inobeta-ui/ui/views/view.module";
import { RoutingModule } from "./routing.module";

import { AuthExampleComponent } from './examples/http/auth.component';
import { HttpExampleComponent } from "./examples/http/http-example.component";

export interface IAppState {
  ibHttpState: IHttpStore;
  countState: ICounterState;
}

const reducers: ActionReducerMap<IAppState> = {
  countState: counterReducer,
  ibHttpState: combineReducers(ibHttpReducers),
};

export const statusErrorMessages = { 404: "Risorsa non trovata" };

const reduxStorageSave = ibSetupHydration("__redux-store-inobeta-ui__", [
  "sessionState",
  "ibTable",
  "lazyLoaded",
  "ibViews",
]);

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    DynamicFormsExampleComponent,
    HttpExampleComponent,
    AuthExampleComponent,
    MyCounterComponent,
    DialogExampleComponent,
    MyCustomTextboxComponent,
    IbToastExampleComponent,
    IbMainMenuExampleComponent,
    IbKaiTableExamplePage,
    IbKaiTableActionColumnExamplePage,
    IbKaiTableFullExamplePage,
    IbKaiTableApiExamplePage,
    MaterialFormArrayExampleComponent,
    MaterialFormExampleComponent,
    MaterialFormGridExampleComponent,
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
    IbKaiTableModule,
    IbFilterModule,
    IbViewModule,
    IbDataExportModule,
    IbTableActionModule,
    StoreModule.forRoot(reducers, {
      metaReducers: reduxStorageSave.metareducers,
      runtimeChecks: {
        strictStateImmutability: false,
        strictActionImmutability: false,
      },
    }),
    EffectsModule.forRoot([
      TableEffects,
      ...reduxStorageSave.effects,
      ...ibHttpEffects,
    ]),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      features: {
        pause: true,
        lock: true,
        persist: true,
      },
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useExisting: IbTranslateModuleLoader,
        deps: [HttpClient],
      },
    }),

    MatCardModule,
  ],
  exports: [FlexLayoutModule],
  providers: [
    //{provide: 'ibSessionStorageKey', useValue: '__redux-store-inobeta-ui__'},
    //{provide: 'ibReduxPersistKeys', useValue: ['sessionState', 'ibTable', 'lazyLoaded']},
    { provide: "HttpMode", useValue: "NORMAL" },
    { provide: "ibHttpToastOnStatusCode", useValue: statusErrorMessages },
    { provide: "ibHttpToastErrorCode", useValue: "code" },
    {
      provide: "ibHttpUrlExcludedFromLoader",
      useValue: [{ url: "http://repubblica.it", method: "GET" }],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
