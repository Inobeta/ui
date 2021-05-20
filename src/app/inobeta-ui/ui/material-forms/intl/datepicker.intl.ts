import { Platform } from '@angular/cdk/platform';
import { Inject, Optional } from '@angular/core';
import { MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';

export class IbMatDatepickerI18n {

    constructor(private readonly translate: TranslateService) {}

    getDateFormats() {
        return {
          parse: {
            dateInput: 'DD/MM/YYYY',
            },
          display: {
            dateInput: 'DD/MM/YYYY',
            monthYearLabel: 'MMMM YYYY',
            dateA11yLabel: 'DD/MM/YYYY',
            monthYearA11yLabel: 'MMMM YYYY',
          }
        };
    }
}

// FIXME: this adapter supports it format only but it is linked to translate service. We must support a dynamic parse and format

export class IbMatDateAdapter extends NativeDateAdapter {
  constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string, platform: Platform) {
    super(matDateLocale, platform);
    super.setLocale(matDateLocale);
  }

  parse(date: string, displayFormat?: string): Date {
    if (date === '') {
      return null;
    }
    const dateParts = date.split('/');
    if (dateParts.length === 3) {
      return new Date(parseInt(dateParts[2], 10), parseInt(dateParts[1], 10) - 1, parseInt(dateParts[0], 10));
    }
    return new Date(NaN);
  }

  format(date: Date, displayFormat: Object): string {
    if (!this.isValid(date)) {
      throw Error('IbMatDateAdapter: Cannot format invalid date.');
    }
   // if (displayFormat === 'input') {
    let day: string = date.getDate().toString();
    day = +day < 10 ? '0' + day : day;
    let month: string = (date.getMonth() + 1).toString();
    month = +month < 10 ? '0' + month : month;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
   // }
   // return date.toDateString();
  }

  isValid(date: Date) {
    return !isNaN(date.getTime());
  }

  invalid(): Date {
    return new Date(NaN);
  }
  deserialize(value: any): Date | null {
    if (!value) {
      return null;
    }
    return super.deserialize(value);
  }
}
