import { Component, Input } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent,
  IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';

/** @deprecated */
@Component({
  selector: '[ib-mat-datepicker]',
  template: `
  <mat-form-field appearance="fill" style="width: 100%;" [formGroup]="data.form">
    <mat-label>{{data.base.label | translate}}</mat-label>
    <input
      [formControlName]="data.base.key"
      matInput
      [matDatepicker]="picker"
      (dateInput)="data.base.change(data.self)"
      (dateChange)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
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

/** @deprecated */
export class IbMatDatepickerControl extends IbFormControlBase<string | Date> {
  constructor(options: IbFormControlBaseParams<string | Date>) {
    if (options.value && typeof options.value === 'string') {
      options.value = new Date(options.value);
    }
    if (!options.value) {
      options.value = null;
    }
    if (options.required) {
      options.validators = options.validators || [];
      options.validators.push(dateRequiredValidator());
    }
    super(options);
    this.control = new IbFormControlBaseComponent(IbMatDatepickerComponent, {
      base: this
    });
  }
}

export function dateRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (!control.value || isNaN(control.value.getTime())) {
      return {
        required: true
      };
    }
  };
}
