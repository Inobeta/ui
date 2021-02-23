import { IbFormControlBase, IbFormControlBaseParams } from 'src/app/inobeta-ui/modules/ui/forms';

export class myCustomTextbox extends IbFormControlBase<string> {
  controlType = 'textbox';
  testField = 'Questa è una prova'
  constructor(options: myCustomTextboxParams) {
    super(options);
    this.testField = options.testField
  }
}

export interface myCustomTextboxParams extends IbFormControlBaseParams<string>{
  testField: string
}
