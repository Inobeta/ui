import { IbFormControlBase } from "../controls/form-control-base";

export interface IFormArrayOptions {
  max: number;
  addFieldLabel: string;
}

export interface IFormArray {
  key: string;
  fields: IbFormControlBase<any>[];
  options?: Partial<IFormArrayOptions>;
  cols?: number;
  rows?: number;
  width?: string;
}

export class IbFormArray implements IFormArray {
  key: string;
  options: Partial<IFormArrayOptions> = {};
  fields: IbFormControlBase<any>[];
  cols: number;
  rows: number;
  width: string;
  readonly role = "array";

  constructor(options: IFormArray) {
    this.key = options.key;
    this.fields = options.fields ?? [];
    this.options = {
      max: Infinity,
      addFieldLabel: "shared.ibForms.array.add",
      ...options.options
    };
    this.cols = options.cols ?? 1;
    this.rows = options.rows ?? 1;
    this.width = options.width || '100%'
  }
}
