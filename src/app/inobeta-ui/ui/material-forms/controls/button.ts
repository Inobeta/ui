import { Component, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData, IbFormControlInterface } from '../../forms/controls/form-control-base';
import { IbModalMessageService } from '../../modal/modal-message.service';

@Component({
  selector: '[ib-mat-button]',
  template: `
<div fxLayout="row" fxLayout="space-around center" style="padding-top:5px;padding-bottom:5px;height:45px;">
  <button
    (click)="handleActionClick()"
    [type]="(data.base.key === 'submit') ? 'submit' : 'button'"
    [disabled]="data.base.disabled || ((data.base.requireValidation) && !data.form.valid)"
    mat-raised-button
    [color]="data.base.color"
  >{{data.base.label | translate}}</button>
</div>
  `
})

export class IbMatButtonComponent implements IbFormControlInterface {
  @Input() data: IbMatButtonData;
  constructor(private dialog: IbModalMessageService) {

  }
  handleActionClick() {
    if (this.data.base.key === 'submit') {
      return;
    }

    if (this.data.base.requireConfirmOnDirty && this.data.form && this.data.form.dirty) {
      return this.dialog.show( {
        title: 'shared.ibForms.unsavedTitle',
        message: 'shared.ibForms.unsavedMessage'
      }).subscribe(result => {
        if (result) {
          this.data.base.handler(this.data.form);
        }
      });
    }

    this.data.base.handler(this.data.form);
  }
}


export class IbMatButtonControl extends IbFormControlBase<string> {
  color;
  handler;
  requireValidation;
  requireConfirmOnDirty;
  constructor(options: IbMatButtonParams) {
    if (options.key === 'submit') { options.requireValidation = true; }
    super(options);
    this.color = options.color || 'primary';
    this.handler = options.handler;
    this.requireValidation = options.requireValidation || false;
    this.requireConfirmOnDirty = options.requireConfirmOnDirty || false;
    this.control = new IbFormControlBaseComponent(IbMatButtonComponent, {
      base: this
    });
  }

}

export interface IbMatButtonParams extends IbFormControlBaseParams<string> {
  color?: string;
  requireValidation?: boolean;
  requireConfirmOnDirty?: boolean;
  handler?: (form: UntypedFormGroup) => void;
}



export interface IbMatButtonData extends IbFormControlData {
  base: IbMatButtonParams;
}

