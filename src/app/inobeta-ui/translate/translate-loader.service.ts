import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateLoader } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ibHttpTranslations } from "../http/translations";
import { ibMaterialFormTranslations } from "../ui/material-forms/translations";
import { ibKaiFilterTranslations } from "../ui/kai-filter/translations";
import { ibViewTranslations } from "../ui/views/translations";
import { ibKaiTableTranslations } from "../ui/kai-table/translations";
import { ibModalTranslations } from "../ui/modal/translations";

@Injectable({providedIn: 'root'})
export class IbTranslateModuleLoader implements TranslateLoader{
  constructor(private http: HttpClient){}
  getTranslation(lang: string): Observable<any> {
    return this.http.get(`./assets/i18n/${lang}.json`).pipe(
      map(tran => ({
        ...tran,
        shared: {
          ...ibHttpTranslations[lang],
          ...ibMaterialFormTranslations[lang],
          ...ibKaiFilterTranslations[lang],
          ...ibViewTranslations[lang],
          ...ibKaiTableTranslations[lang],
          ...ibModalTranslations[lang],
          ...(tran['shared'] ?? {})
        }
      }))
    )
  }
}
