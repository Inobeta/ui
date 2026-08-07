import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData, IbFormControlInterface } from '../../forms/controls/form-control-base';
@Component({
    selector: '[ib-mat-padding]',
    template: ``,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class IbMatPaddingComponent implements IbFormControlInterface {
  @Input() data: IbFormControlData;
}
export class IbMatPaddingControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatPaddingComponent, {
      base: this
    })
  }
}
