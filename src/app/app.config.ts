import { registerLocaleData } from "@angular/common";
import { HttpClient, provideHttpClient } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection } from "@angular/core";
import { EffectsModule } from "@ngrx/effects";
import { ActionReducerMap, StoreModule, combineReducers } from "@ngrx/store";
import { provideStoreDevtools} from "@ngrx/store-devtools";
import { provideTranslateService, TranslateLoader, TranslateModule } from "@ngx-translate/core";
import {
  ICounterState,
  counterReducer,
} from "./examples/redux-example/counter.reducer";
import { IbHttpModule } from "./inobeta-ui/http/http.module";
import {
  IHttpStore,
  ibHttpEffects,
  ibHttpReducers,
} from "./inobeta-ui/http/store";
import { ibSetupHydration } from "./inobeta-ui/hydration";
import { IbTranslateModuleLoader } from "./inobeta-ui/translate/translate-loader.service";
import { appRoutes } from "./routing.module";
import localeIt from '@angular/common/locales/it';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from "@angular/router";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


registerLocaleData(localeIt);

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



export const appConfig: ApplicationConfig = {
  providers: [
    { provide: "HttpMode", useValue: "NORMAL" },
    { provide: "ibHttpToastOnStatusCode", useValue: statusErrorMessages },
    { provide: "ibHttpToastErrorCode", useValue: "code" },
    {
      provide: "ibHttpUrlExcludedFromLoader",
      useValue: [{ url: "http://repubblica.it", method: "GET" }],
    },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    provideAnimationsAsync(),
    provideHttpClient(),

    //FIXME: This should work according to the ngx-translate documentation, but it doesn't work at all.
    /*provideTranslateService({
        loader: {
          provide: TranslateLoader,
          useExisting: IbTranslateModuleLoader,
          deps: [HttpClient],
        },
    }),*/

    // @important! This is a hack for @inobeta/ui, especially IbKaiTable.
    // Change this to Standalone API providers in v19
    importProvidersFrom([
      StoreModule.forRoot(reducers, {
        metaReducers: reduxStorageSave.metareducers,
      }),
      EffectsModule.forRoot([
        ...reduxStorageSave.effects,
        ...ibHttpEffects,
      ]),
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useExisting: IbTranslateModuleLoader,
          deps: [HttpClient],
        },
      }),
      IbHttpModule
      ]
    ),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      connectInZone: true,
    })
  ],
};

