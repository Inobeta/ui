import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams } from '../../forms/controls/form-control-base';
import { Injector, Pipe, PipeTransform, InjectionToken } from '@angular/core';
import { PercentPipe, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: '[ib-mat-label]',
  template: `
    <div fxFlex style="width:100%;height:50px;;"  fxLayout="row" fxFlexAlign="center" >
      <div
        *ngIf="data.base.label"
        style="padding-right:10px;"
        fxLayout="row"
        fxFlexAlign="center"
        fxFlex="40%"
      >{{data.base.label | translate}}: </div>
      <div
        *ngIf="data.base.value"
        style="font-weight:bold;"
        fxLayout="row"
        fxFlexAlign="center"
        fxFlex="60%"
      >{{ data.base.value }}</div>
</div>
  `
})

export class IbMatLabelComponent implements IbFormControlInterface {
  @Input() data: any;
}


export class IbMatLabelControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatLabelComponent, {
      base: this
    })
  }
}
