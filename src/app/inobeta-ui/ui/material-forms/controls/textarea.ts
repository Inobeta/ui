import { Component, Input } from '@angular/core';
import { IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlInterface } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-textarea]',
  template: `
  <mat-form-field appearance="fill" style="width: 100%;" [formGroup]="data.form">
    <mat-label>{{data.base.label | translate}}</mat-label>
    <textarea
      matInput
      [formControlName]="data.base.key"
      [id]="data.base.key"
      [type]="data.base.type"
      (keyup)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
      [style.height]="data.base.height"
    ></textarea>
    <mat-error>
      <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
    </mat-error>
  </mat-form-field>
  `
})

export class IbMatTextareaComponent implements IbFormControlInterface {
  @Input() data: any;
}


export class IbMatTextareaControl extends IbFormControlBase<string>{
  height = 'auto'
  constructor(options: IbMatTextareaParams){
    super(options)
    this.height = options.height || 'auto';
    this.control = new IbFormControlBaseComponent(IbMatTextareaComponent, {
      base: this
    })
  }
}


export interface IbMatTextareaParams extends IbFormControlBaseParams<string>{
  height?: string;
}
