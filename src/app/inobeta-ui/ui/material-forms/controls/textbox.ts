import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-textbox]',
  template: `
  <mat-form-field appearance="fill" style="width: 100%;" [formGroup]="data.form">
    <mat-label>{{data.base.label | translate}} {{(data.base.required) ? '*' : ''}}</mat-label>
    <input
      matInput
      [formControlName]="data.base.key"
      [id]="data.base.key"
      [type]="data.base.type"
      (keyup)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
    />
    <mat-error>
      <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
    </mat-error>
  </mat-form-field>
  `
})

export class IbMatTextboxComponent implements IbFormControlInterface {
  @Input() data: any;
}


export class IbMatTextboxControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatTextboxComponent, {
      base: this
    })
  }
}
