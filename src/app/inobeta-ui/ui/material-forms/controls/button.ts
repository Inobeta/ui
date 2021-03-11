import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlInterface } from "../../forms/controls/form-control-base";

@Component({
  selector: '[tf-button-form]',
  template: `
<div fxLayout="row" fxLayout="space-around center">
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
  @Input() data: any;
  handleActionClick() {
    if (this.data.base.key === 'submit') {
      return;
    }
    this.data.base.handler(this.data.form);
  }
}


export class IbMatButtonControl extends IbFormControlBase<string>{
  color;
  handler;
  requireValidation;
  constructor(options: IbMatButtonParams){
    if(options.key === 'submit') options.requireValidation = true;
    super(options)
    this.color = options.color || 'primary';
    this.handler = options.handler;
    this.requireValidation = options.requireValidation || false;
    this.control = new IbFormControlBaseComponent(IbMatButtonComponent, {
      base: this
    })
  }

}

export interface IbMatButtonParams extends IbFormControlBaseParams<string> {
  color?: string;
  requireValidation?: boolean;
  handler?: (form: FormGroup) => void;
}


