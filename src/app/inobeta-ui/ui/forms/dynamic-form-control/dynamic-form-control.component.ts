import { Component, OnInit, Input } from '@angular/core';
import { IbFormControlBase } from '../controls/form-control-base';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'ib-dynamic-form-control',
  templateUrl: './dynamic-form-control.component.html',
  host: {
    class: 'ibFormControl'
  },
})
/**
 * @deprecated Do not use this component. It will be removed in a future release
 */
export class IbDynamicFormControlComponent {
  @Input() base: IbFormControlBase<any>;
  @Input() form: UntypedFormGroup;

  get self(): UntypedFormControl { return this.form.get(this.base.key) as UntypedFormControl; }

  hasError(e) {
    return this.self.hasError(e);
  }
}
