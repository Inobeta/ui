import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';

/** @deprecated */
@Component({
  selector: '[ib-mat-label]',
  template: `
    <div style="width:100%;height:50px;">
      <div
        *ngIf="data.base.label"
        style="padding-right:10px;"
      >{{data.base.label | translate}}: </div>
      <div
        *ngIf="data.base.value"
        style="font-weight:bold;"
      >{{ data.base.value }}</div>
</div>
  `
})

export class IbMatLabelComponent implements IbFormControlInterface {
  @Input() data: IbFormControlData;
}

/** @deprecated */
export class IbMatLabelControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatLabelComponent, {
      base: this
    })
  }
}
