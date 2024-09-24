import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-radio]',
  template: `
  <div style="width: 100%;" [formGroup]="data.form">
    <mat-label [attr.for]="data.base.key" style="display: block">{{data.base.label | translate}} {{(data.base.required) ? '*' : ''}}</mat-label>
        <mat-radio-group
        [formControlName]="data.base.key"
        (change)="data.base.change(data.self)"
        >
          <mat-radio-button style="margin: 5px" *ngFor="let opt of data.base.options" [value]="opt.key">
            {{opt.value | translate}}
          </mat-radio-button>
        </mat-radio-group>
    <mat-error>
      <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
    </mat-error>
</div>
  `
})

export class IbMatRadioComponent implements IbFormControlInterface {
  @Input() data: IbFormControlData;
}

/** @deprecated */
export class IbMatRadioControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options);
    this.control = new IbFormControlBaseComponent(IbMatRadioComponent, {
      base: this
    });
  }
}
