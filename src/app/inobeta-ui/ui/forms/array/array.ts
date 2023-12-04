import { IbFormControlBase } from "../controls/form-control-base";

export interface IFormArrayOptions {
  min?: number;
  max?: number;
}

export interface IFormArray {
  key: string;
  fields: IbFormControlBase<any>[];
  options?: IFormArrayOptions;
}

export class IbFormArray implements IFormArray {
  key: string;
  options?: IFormArrayOptions;
  fields: IbFormControlBase<any>[];
  readonly role = "array";

  constructor(options: IFormArray) {
    this.key = options.key;
    this.fields = options.fields ?? [];
    this.options = options.options ?? {
      min: 0,
      max: Infinity,
    };
  }
}
