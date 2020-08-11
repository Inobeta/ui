import { Component, OnInit, Input } from '@angular/core';
import { FormControlBase } from '../controls/form-control-base';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ib-dynamic-form-control',
  templateUrl: './dynamic-form-control.component.html',
  host: {
    class: 'ibFormControl'
  },
})
export class DynamicFormControlComponent {
  @Input() base: FormControlBase<string>;
  @Input() form: FormGroup;

  constructor() { }

  get isValid() { return this.form.get(this.base.key).valid; }

  get isInvalid() { return this.form.get(this.base.key).invalid; }

  hasError(e) { return this.form.get(this.base.key).hasError(e); }
}
