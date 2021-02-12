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

  get self() { return this.form.get(this.base.key); }

  hasError(e) { return this.self.hasError(e); }
}
