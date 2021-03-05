import { FormControl, ValidatorFn, Form } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Type } from '@angular/core';

export class IbFormControlBase<T> {
  public value: T;
  public disabled: boolean;
  public key: string;
  public label: string;
  public required: boolean;
  public order: number;
  public controlType: string;
  public type: string;
  public validators: ValidatorFn[];
  public errors: {message: string, condition: (c: FormControl) => void}[];
  public options: {key?: string, value: string}[];
  public change: (c: FormControl) => void;
  public width: string;
  public control: IbFormControlBaseComponent;

  constructor(options: IbFormControlBaseParams<T> = {}) {

    this.value = options.value;
    this.disabled = options.disabled || false;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.validators = options.validators || [];
    this.errors = options.errors || [];
    this.options = options.options || [];
    this.width = options.width || '';
    this.control = options.control || null;
    this.setupChangeEvent(options)
  }


  private setupChangeEvent(options){

    let previousValue = this.value;
    const changeSubject = new Subject();
    this.change = (c: FormControl) => {
      if(options.change && c.value !== previousValue) changeSubject.next(c);
    }
    changeSubject.pipe(
      debounceTime(700)
    ).subscribe((control: FormControl) => {
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
  errors?: {message: string, condition: (c: FormControl) => void}[];
  options?: {key?: string, value: string}[];
  change?: (c: FormControl) => void;
  width?: string;
  control?: IbFormControlBaseComponent;
}

export interface IbFormControlInterface {
  data: any;
}


export class IbFormControlBaseComponent {
  constructor(public component: Type<any>, public data: any) {}
}
