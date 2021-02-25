import { IbFormControlBase, IbFormControlBaseParams } from 'src/app/inobeta-ui/ui/forms';

export class MyCustomTextbox extends IbFormControlBase<string> {
  controlType = 'textbox';
  testField = 'Questa è una prova';
  constructor(options: MyCustomTextboxParams) {
    super(options);
    this.testField = options.testField;
  }
}

export interface MyCustomTextboxParams extends IbFormControlBaseParams<string> {
  testField: string;
}
