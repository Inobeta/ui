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

  get self() { return this.form.get(this.base.key); }

  get isValid() { return this.self.valid; }

  get isInvalid() { return this.self.invalid; }

  hasError(e) { return this.self.hasError(e); }
}
