import { HttpClient } from "@angular/common/http";
import { inject, Injectable, InjectionToken } from "@angular/core";
import { TranslateLoader } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ibHttpTranslations } from "../http/translations";
import { ibMaterialFormTranslations } from "../ui/material-forms/translations";
import { ibKaiFilterTranslations } from "../ui/kai-filter/translations";
import { ibViewTranslations } from "../ui/views/translations";
import { ibKaiTableTranslations } from "../ui/kai-table/translations";
import { ibModalTranslations } from "../ui/modal/translations";
import { ibFormTranslations } from "../ui/forms-utilities/translations";


export const IB_TRANSLATE_ASSETS_PATH = new InjectionToken<string>('ibTranslateAssetsPath');

@Injectable({providedIn: 'root'})
export class IbTranslateModuleLoader implements TranslateLoader{
  private ibTranslateAssetsPath = inject(IB_TRANSLATE_ASSETS_PATH, { optional: true }) ?? './assets/i18n/';
  private http = inject(HttpClient);

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.ibTranslateAssetsPath}${lang}.json`).pipe(
      map(tran => ({
        ...tran,
        shared: {
          ...ibHttpTranslations[lang],
          ...ibMaterialFormTranslations[lang],
          ...ibKaiFilterTranslations[lang],
          ...ibViewTranslations[lang],
          ...ibKaiTableTranslations[lang],
          ...ibModalTranslations[lang],
          ...ibFormTranslations[lang],
          ...(tran['shared'] ?? {})
        }
      }))
    )
  }
}
