import { FormControl, ValidatorFn } from '@angular/forms';

export class IbFormControlBase<T> {
  value: T;
  key: string;
  label: string;
  required: boolean;
  order: number;
  controlType: string;
  type: string;
  validators: ValidatorFn[];
  errors: {message: string, condition: (c: FormControl) => void}[];
  options: {key: string, value: string}[];

  constructor(options: IbFormControlBaseParams<T> = {}) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.controlType = options.controlType || '';
    this.type = options.type || '';
    this.validators = options.validators || [];
    this.errors = options.errors || [];
    this.options = options.options || [];
  }
}

export interface IbFormControlBaseParams<T> {
  value?: T;
  key?: string;
  label?: string;
  required?: boolean;
  order?: number;
  controlType?: string;
  type?: string;
  validators?: ValidatorFn[];
  errors?: {message: string, condition: (c: FormControl) => void}[];
  options?: {key: string, value: string}[];
}
