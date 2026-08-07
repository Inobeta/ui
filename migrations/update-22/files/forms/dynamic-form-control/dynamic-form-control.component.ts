import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { IbFormControlBase } from '../controls/form-control-base';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';

@Component({
  selector: 'ib-dynamic-form-control',
  templateUrl: './dynamic-form-control.component.html',
  host: {
    class: 'ibFormControl'
  },
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class IbDynamicFormControlComponent {
  @Input() base: IbFormControlBase<any>;
  @Input() form: UntypedFormGroup;

  get self(): UntypedFormControl { return this.form.get(this.base.key) as UntypedFormControl; }

  hasError(e) {
    return this.self.hasError(e);
  }
}
