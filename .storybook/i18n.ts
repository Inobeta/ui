import { NgModule } from "@angular/core";
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { of } from "rxjs";
import translations from "../src/assets/i18n/it.json";
import { ibHttpTranslations } from "../src/app/inobeta-ui/http/translations";
import { ibFormTranslations } from "../src/app/inobeta-ui/ui/forms-utilities/translations";
import { ibKaiFilterTranslations } from "../src/app/inobeta-ui/ui/kai-filter/translations";
import { ibKaiTableTranslations } from "../src/app/inobeta-ui/ui/kai-table/translations";
import { ibMaterialFormTranslations } from "../src/app/inobeta-ui/ui/material-forms/translations";
import { ibModalTranslations } from "../src/app/inobeta-ui/ui/modal/translations";
import { ibViewTranslations } from "../src/app/inobeta-ui/ui/views/translations";

const storybookTranslations = {
  ...translations,
  shared: {
    ...ibHttpTranslations.it,
    ...ibMaterialFormTranslations.it,
    ...ibKaiFilterTranslations.it,
    ...ibViewTranslations.it,
    ...ibKaiTableTranslations.it,
    ...ibModalTranslations.it,
    ...ibFormTranslations.it,
    ...translations.shared,
  },
};

const storybookTranslateLoader: TranslateLoader = {
  getTranslation: () => of(storybookTranslations),
};

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useValue: storybookTranslateLoader,
      },
    }),
  ],
})
export class StorybookTranslateModule {
  constructor(translateService: TranslateService) {
    translateService.setDefaultLang("it");
    translateService.use("it");
  }
}
