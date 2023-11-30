import { IbFormControlBase } from "../controls/form-control-base";

export interface IFormArray {
  key: string;
  fields: IbFormControlBase<any>[];
}

export class IbFormArray implements IFormArray {
  key: string;
  fields: IbFormControlBase<any>[];
  readonly role = 'array';

  constructor(options: IFormArray) {
    this.key = options.key;
    this.fields = options.fields ?? [];
  }
}
