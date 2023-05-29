import { NgModule } from "@angular/core";
import { TranslateLoader, TranslateModule, TranslateService } from "@ngx-translate/core";
import { of } from "rxjs";

export const staticTranslateLoader: TranslateLoader = {
  getTranslation(lang: string) {
      return of(require('../src/assets/i18n/it.json'));
  }
};

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useValue: staticTranslateLoader,
      },
    }),
  ],
})
export class StorybookTranslateModule {
  constructor(translateService: TranslateService) {
    console.log("Configuring the translation service: ", translateService);
    console.log("Translations: ", translateService.translations);
    translateService.setDefaultLang("it");
    translateService.use("it");
  }
}
