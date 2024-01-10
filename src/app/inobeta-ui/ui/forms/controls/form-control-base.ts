import { UntypedFormControl, ValidatorFn, Form, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TemplateRef, Type } from '@angular/core';

export class IbFormControlBase<T> {
  /** @deprecated Use the `value` input in `ib-material-form` instead */
  public value: T;
  public disabled: boolean;
  public key: string;
  public label: string;
  public required: boolean;
  public order: number;
  public controlType: string;
  public type: string;
  public validators: ValidatorFn[];
  public options: {key?: string | number, value: string}[];
  public change: (c: UntypedFormControl) => void;
  public width: string;
  public control: IbFormControlBaseComponent;
  public cols: number;
  public rows: number;
  public debounceOnChange: number;
  readonly role = 'control';

  constructor(options: IbFormControlBaseParams<T> = {}) {

    this.value = options.value;
    this.disabled = options.disabled || false;
    this.key = options.key || '';
    this.label = options.label || '';
    this.validators = options.validators || [];
    this.required = !!options.required;
    if(this.validators.indexOf(Validators.required) >= 0){
      this.required = true;
    }
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.options = options.options || [];
    this.width = options.width || '';
    this.control = options.control || null;
    this.cols = options.cols || 1;
    this.rows = options.rows || 1;
    this.debounceOnChange = (options.debounceOnChange >= 0) ? options.debounceOnChange : 0;
    this.setupChangeEvent(options);
  }


  private setupChangeEvent(options) {

    let previousValue = this.value;
    const changeSubject = new Subject();
    this.change = (c: UntypedFormControl) => {
      if (options.change && c.value !== previousValue) { changeSubject.next(c); }
    };
    changeSubject.pipe(
      debounceTime(this.debounceOnChange)
    ).subscribe((control: UntypedFormControl) => {
      previousValue = control.value;
      options.change(control);
    });

  }

}

export interface IbFormControlBaseParams<T> {
  value?: T;
  disabled?: boolean;
  key?: string;
  label?: string;
  required?: boolean;
  order?: number;
  controlType?: string;
  type?: string;
  validators?: ValidatorFn[];
  options?: {key?: string | number, value: string}[];
  change?: (c: UntypedFormControl) => void;
  width?: string;
  control?: IbFormControlBaseComponent;
  cols?: number;
  rows?: number;
  debounceOnChange?: number;
}

export interface IbFormControlInterface {
  data: IbFormControlData;
}


export class IbFormControlBaseComponent {
  constructor(public component: Type<any>, public data: IbFormControlData) {}
}

export interface IbFormControlData {
  base: IbFormControlBaseParams<any>;
  self?: UntypedFormControl;
  form?: UntypedFormGroup;
  hasError?: (errorCode: string) => boolean;
  formControlErrors?: TemplateRef<any>;
}
