import { Component, OnInit, Input } from '@angular/core';
import { IbFormControlBase } from '../controls/form-control-base';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'ib-dynamic-form-control',
  templateUrl: './dynamic-form-control.component.html',
  host: {
    class: 'ibFormControl'
  },
})
//@deprecated
export class IbDynamicFormControlComponent {
  @Input() base: IbFormControlBase<string>;
  @Input() form: FormGroup;

  get self():FormControl { return this.form.get(this.base.key) as FormControl; }

  hasError(e) {
    return this.self.hasError(e);
  }
}
