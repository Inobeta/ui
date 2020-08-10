import { Component, OnInit, Input } from '@angular/core';
import { FormBase } from '../form-base';
import { FormGroup } from '@angular/forms';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[ib-dynamic-form-control]',
  templateUrl: './dynamic-form-control.component.html',
})
export class DynamicFormControlComponent {
  @Input() base: FormBase<string>;
  @Input() form: FormGroup;

  constructor() { }

  get isValid() { return this.form.controls[this.base.key].valid; }
}
