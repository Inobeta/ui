import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';
import { NativeDateAdapter, MatDateFormats, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';
export class AppDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
      if (displayFormat === 'input') {
          let day: string = date.getDate().toString();
          day = +day < 10 ? '0' + day : day;
          let month: string = (date.getMonth() + 1).toString();
          month = +month < 10 ? '0' + month : month;
          const year = date.getFullYear();
          return `${day}/${month}/${year}`;
      }
      return date.toDateString();
  }
}
export const APP_DATE_FORMATS: MatDateFormats = {
  parse: {
      dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
      dateInput: 'input',
      monthYearLabel: { year: 'numeric', month: 'numeric' },
      dateA11yLabel: {
          year: 'numeric', month: 'long', day: 'numeric'
      },
      monthYearA11yLabel: { year: 'numeric', month: 'long' },
  }
};



@Component({
  selector: '[ib-mat-datepicker]',
  template: `
  <mat-form-field appearance="fill" style="width: 100%;" [formGroup]="data.form">
    <mat-label>{{data.base.label | translate}} {{(data.base.required) ? '*' : ''}}</mat-label>
    <input
      [formControlName]="data.base.key"
      matInput
      [matDatepicker]="picker"
      (dateInput)="data.base.change(data.self)"
      (dateChange)="data.base.change(data.self)"
    >
    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
    <mat-datepicker #picker></mat-datepicker>
    <mat-error>
      <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
    </mat-error>
  </mat-form-field>
  `,
  providers: [
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' }
  ]
})

export class IbMatDatepickerComponent implements IbFormControlInterface {
  @Input() data: IbFormControlData;
}


export class IbMatDatepickerControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatDatepickerComponent, {
      base: this
    })
  }
}
