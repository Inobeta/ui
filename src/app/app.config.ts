import { registerLocaleData } from "@angular/common";
import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from "@angular/core";
import { provideEffects } from "@ngrx/effects";
import { provideState, provideStore } from "@ngrx/store";
import { provideStoreDevtools} from "@ngrx/store-devtools";
import { provideTranslateService, TranslateLoader } from "@ngx-translate/core";

import { provideIbHttp } from "./inobeta-ui/http/http.module";
import {
  ibHttpEffects,
  ibLoaderFeature,
  ibSessionFeature,
} from "./inobeta-ui/http/store";
import { ibSetupHydration } from "./inobeta-ui/hydration";
import { IbTranslateModuleLoader } from "./inobeta-ui/translate/translate-loader.service";
import { appRoutes } from "./routing.module";
import localeIt from '@angular/common/locales/it';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from "@angular/router";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ibCounterExampleFeature } from "./examples/redux-example/counter.feature";
import { IbAuthInterceptor } from "./inobeta-ui/http/http/auth.interceptor";
import { IbErrorInterceptor } from "./inobeta-ui/http/http/error.interceptor";
import { IbLoaderInterceptor } from "./inobeta-ui/http/http/loader.interceptor";


registerLocaleData(localeIt);


export const statusErrorMessages = { 404: "Risorsa non trovata" };

const reduxStorageSave = ibSetupHydration("__redux-store-inobeta-ui__", [
  "ibHttpSessionState",
  "exampleLazyFeature",
  "ibTable",
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
    provideHttpClient(
      withInterceptors([
        IbAuthInterceptor//, IbErrorInterceptor, IbLoaderInterceptor
      ])
    ),
    provideIbHttp(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useExisting: IbTranslateModuleLoader,
        deps: [HttpClient],
      },
    }),
    provideStore(undefined, { metaReducers: reduxStorageSave.metareducers }),
    provideState(ibSessionFeature),
    provideState(ibLoaderFeature),
    provideState(ibCounterExampleFeature),
    provideEffects(ibHttpEffects),
    provideEffects(reduxStorageSave.effects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      connectInZone: true,
    })
  ],
};

