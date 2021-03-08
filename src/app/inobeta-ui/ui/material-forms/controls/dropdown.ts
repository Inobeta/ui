import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-dropdown]',
  template: `
    <mat-form-field appearance="fill" style="width: 100%;"  [formGroup]="data.form">
      <mat-label>{{data.base.label | translate}}</mat-label>
      <mat-select
        [formControlName]="data.base.key"
        (selectionChange)="data.base.change(data.self)"
      >
        <mat-option *ngFor="let opt of data.base.options" [value]="opt.key">
          {{opt.value | translate}}
        </mat-option>
      </mat-select>
      <mat-error>
        <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
      </mat-error>
    </mat-form-field>
  `
})

export class IbMatDropdownComponent implements IbFormControlInterface {
  @Input() data: any;
}


export class IbMatDropdownControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    this.control = new IbFormControlBaseComponent(IbMatDropdownComponent, {
      base: this
    })
  }
}
