import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams } from '../../forms/controls/form-control-base';
import { Injector, Pipe, PipeTransform, InjectionToken } from '@angular/core';
import { PercentPipe, CurrencyPipe, DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: '[ib-mat-label]',
  template: `
    <mat-label fxFlex style="width:100%;"  fxLayout="row" fxFlexAlign="center" >
      <span *ngIf="data.base.label" style="padding-right:10px;">{{data.base.label | translate}}: </span>
      <b *ngIf="data.base.value">{{ data.base.value }}</b>
    </mat-label>
  `
})

export class IbMatLabelComponent implements IbFormControlInterface {
  @Input() data: any;
}


export class IbMatLabelControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    super.control = new IbFormControlBaseComponent(IbMatLabelComponent, {
      base: this
    })
  }
}
