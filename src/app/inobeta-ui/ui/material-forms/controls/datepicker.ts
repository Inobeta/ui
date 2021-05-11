import { Component, Input } from '@angular/core';
import { DateAdapter } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent,
  IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';

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
  `
})

export class IbMatDatepickerComponent implements IbFormControlInterface {
  @Input() data: IbFormControlData;
  constructor(
    private adapter: DateAdapter<any>,
    private translate: TranslateService
  ) {
    this.adapter.setLocale(this.translate.currentLang);
    this.translate.onTranslationChange.subscribe(ev => {
      this.adapter.setLocale(ev.lang);
    });
  }
}


export class IbMatDatepickerControl extends IbFormControlBase<string | Date> {
  constructor(options: IbFormControlBaseParams<string | Date>) {
    super(options);
    if (options.value && typeof options.value === 'string') {
      this.value = new Date(options.value);
    }

    this.control = new IbFormControlBaseComponent(IbMatDatepickerComponent, {
      base: this
    });
  }
}
