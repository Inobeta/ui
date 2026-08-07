import { registerLocaleData } from "@angular/common";
import { HttpClient, provideHttpClient, withXhr } from "@angular/common/http";
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from "@angular/core";
import { provideEffects } from "@ngrx/effects";
import { provideStore } from "@ngrx/store";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { provideTranslateService, TranslateLoader } from "@ngx-translate/core";

import { ibSetupHydration } from "./inobeta-ui/hydration";
import { IbTranslateModuleLoader } from "./inobeta-ui/translate/translate-loader.service";
import { appRoutes } from "./routing.module";
import localeIt from '@angular/common/locales/it';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from "@angular/router";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { IbCSVExportProvider, IbXLXSExportProvider, IbPDFExportProvider } from "./inobeta-ui/ui/data-export";


registerLocaleData(localeIt);


const reduxStorageSave = ibSetupHydration("__redux-store-inobeta-ui__", [
  "exampleLazyFeature",
  "ibTable",
]);



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      withPreloading(PreloadAllModules)
    ),
    provideAnimationsAsync(),
    provideHttpClient(withXhr()),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useExisting: IbTranslateModuleLoader,
        deps: [HttpClient],
      },
    }),
    provideStore(undefined, { metaReducers: reduxStorageSave.metareducers }),
    provideEffects(reduxStorageSave.effects),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      connectInZone: true,
    }),
    IbXLXSExportProvider,
    IbPDFExportProvider,
    IbCSVExportProvider,
  ],
};
