import { Component, Input } from '@angular/core';
import { IbFormControlBase, IbFormControlBaseComponent,
  IbFormControlBaseParams, IbFormControlData, IbFormControlInterface } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-slide-toggle]',
  template: `
    <div style="width: 100%;" [formGroup]="data.form">
        <mat-slide-toggle
            [formControlName]="data.base.key"
            (change)="data.base.change(data.self)"
        >
            {{data.base.label | translate}}{{(data.base.required) ? '*' : ''}}
        </mat-slide-toggle>
        <mat-error>
            <ng-container
                *ngTemplateOutlet="data.formControlErrors;context: this">
            </ng-container>
        </mat-error>
    </div>
  `
})

export class IbMatSlideToggleComponent implements IbFormControlInterface {
  @Input() data: IbFormControlData;
}


export class IbMatSlideToggleControl extends IbFormControlBase<boolean | number | string> {
  constructor(options: IbFormControlBaseParams<boolean | number | string>) {
    if (!options.value) {
        options.value = false;
    }
    super(options);
    this.control = new IbFormControlBaseComponent(IbMatSlideToggleComponent, {
      base: this
    });
  }
}
