import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';

@Component({
    selector: '[ib-mat-label]',
    template: `
    <div style="width:100%;height:50px;">
      @if (data.base.label) {
        <div
          style="padding-right:10px;"
        >{{data.base.label | translate}}: </div>
      }
      @if (data.base.value) {
        <div
          style="font-weight:bold;"
        >{{ data.base.value }}</div>
      }
    </div>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class IbMatLabelComponent implements IbFormControlInterface {
  @Input() data: IbFormControlData;
}

export class IbMatLabelControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatLabelComponent, {
      base: this
    })
  }
}
