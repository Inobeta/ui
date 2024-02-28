import { IbFormControlBase } from "../controls/form-control-base";

export interface IFormArrayOptions {
  /** Max numbers of lines that an user can add to this form array */
  max: number;
  /** Label for the button to add the first line (i18n) */
  addFieldLabel: string;
}

export interface IFormArray {
  /** Property name for this form array. Corresponds to a FormGroup key */
  key: string;
  /** Form control definition. These fields will be repeated for each line */
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
