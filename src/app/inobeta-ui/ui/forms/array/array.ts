import { IbFormControlBase } from "../controls/form-control-base";

export interface IFormArrayOptions {
  min?: number;
  max?: number;
}

export interface IFormArray {
  key: string;
  fields: IbFormControlBase<any>[];
  options?: IFormArrayOptions;
  cols?: number;
  rows?: number;
  width?: string;
}

export class IbFormArray implements IFormArray {
  key: string;
  options?: IFormArrayOptions;
  fields: IbFormControlBase<any>[];
  cols: number;
  rows: number;
  width: string;
  readonly role = "array";

  constructor(options: IFormArray) {
    this.key = options.key;
    this.fields = options.fields ?? [];
    this.options = options.options ?? {
      min: 1,
      max: Infinity,
    };
    this.cols = options.cols ?? 1;
    this.rows = options.rows ?? 1;
    this.width = options.width || '100%'
  }
}
