import { Component, Input } from '@angular/core';
import { IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData, IbFormControlInterface } from '../../forms/controls/form-control-base';
/** @deprecated */
@Component({
  selector: '[ib-mat-padding]',
  template: ``
})
export class IbMatPaddingComponent implements IbFormControlInterface {
  @Input() data: IbFormControlData;
}
/** @deprecated */
export class IbMatPaddingControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatPaddingComponent, {
      base: this
    })
  }
}
