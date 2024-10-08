import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent,
  IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';

  /** @deprecated */
@Component({
  selector: '[ib-mat-checkbox]',
  template: `
  <div style="width: 100%;" [formGroup]="data.form">
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
  @Input() data: IbFormControlData;
}


/** @deprecated */
export class IbMatCheckboxControl extends IbFormControlBase<boolean | number | string> {
  constructor(options: IbFormControlBaseParams<boolean | number | string>) {
    if (!options.value) { options.value = false; }
    super(options);
    this.control = new IbFormControlBaseComponent(IbMatCheckboxComponent, {
      base: this
    });
  }
}
