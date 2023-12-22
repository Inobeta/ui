import { Inject, Injectable, Optional } from '@angular/core';
import { MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';

export class IbMatDatepickerI18n {

    getDateFormats() {
        return {
          parse: {
            dateInput: 'dd/MM/yyyy',
            },
          display: {
            dateInput: 'dd/MM/yyyy',
            monthYearLabel: 'MMMM yyyy',
            dateA11yLabel: 'dd/MM/yyyy',
            monthYearA11yLabel: 'MMMM yyyy',
          }
        };
    }
}

// FIXME: this adapter supports it format only but it is linked to translate service. We must support a dynamic parse and format

@Injectable({providedIn: 'root'})
export class IbMatDateAdapter extends NativeDateAdapter {
  constructor(@Optional() @Inject(MAT_DATE_LOCALE) matDateLocale: string) {
    super(matDateLocale);
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
