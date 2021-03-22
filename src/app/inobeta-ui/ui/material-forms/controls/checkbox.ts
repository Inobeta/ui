import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-checkbox]',
  template: `
  <div style="width: 100%;line-height:50px;" [formGroup]="data.form">
      <mat-checkbox
        [formControlName]="data.base.key"
        (change)="data.base.change(data.self)"
      >{{data.base.label | translate}}{{(data.base.required) ? '*' : ''}}</mat-checkbox>
    <mat-error>
      <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
    </mat-error>
</div>
  `
})

export class IbMatCheckboxComponent implements IbFormControlInterface {
  @Input() data: any;
}


export class IbMatCheckboxControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatCheckboxComponent, {
      base: this
    })
  }
}
