import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule, importProvidersFrom } from "@angular/core";
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from "@ngx-translate/core";
import { IbTranslateModuleLoader } from "../src/app/inobeta-ui/translate/translate-loader.service";

@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useExisting: IbTranslateModuleLoader,
        deps: [HttpClient],
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
