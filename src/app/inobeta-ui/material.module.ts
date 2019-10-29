import {forwardRef, Injectable, NgModule} from '@angular/core';
import {
  MatButtonModule,
  MatCheckboxModule, MatChipsModule, MatDialogModule, MatIconModule, MatInputModule, MatMenuModule, MatPaginatorIntl,
  MatPaginatorModule,
  MatSelectModule, MatSnackBarModule,
  MatSortModule
} from '@angular/material';
import {MatRadioModule} from '@angular/material/radio';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateModule, TranslateService} from '@ngx-translate/core';


@Injectable()
export class PaginatorTranslations extends MatPaginatorIntl {
  translations = {
    'it': {
      'items_page': 'Elementi per pagina',
      'of': 'di',
      'next_page': 'Pagina successiva',
      'prev_page': 'Pagina precedente',
      'first_page': 'Inizio',
      'last_page': 'Fine'
    }
  };

  constructor(private srvTranslate: TranslateService) {
    super();
    const labels = this.translations[this.srvTranslate.currentLang];
    this.itemsPerPageLabel = labels['items_page'];
    this.firstPageLabel = labels['first_page'];
    this.lastPageLabel = labels['last_page'];
    this.nextPageLabel = labels['next_page'];
    this.previousPageLabel = labels['prev_page'];
    this.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 ${labels['of']} ${length}`;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} ${labels['of']} ${length}`;
    };
  }
}

@NgModule({
  exports: [
    MatRadioModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatSortModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    MatPaginatorModule,
    MatSelectModule,
    MatButtonModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  providers: [
    {provide: MatPaginatorIntl, useClass: forwardRef(() => PaginatorTranslations)}
  ],
  imports: [
    TranslateModule
  ]
})
export class CustomMaterialModule {
}
