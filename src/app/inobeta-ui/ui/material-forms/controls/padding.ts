import { Component, Input } from '@angular/core';
import { IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlInterface } from '../../forms/controls/form-control-base';
@Component({
  selector: '[ib-mat-padding]',
  template: ``
})
export class IbMatPaddingComponent implements IbFormControlInterface {
  @Input() data: any;
}

export class IbMatPaddingControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatPaddingComponent, {
      base: this
    })
  }
}
