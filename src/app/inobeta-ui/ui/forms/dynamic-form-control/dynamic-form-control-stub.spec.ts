import { Component, OnInit, Input } from '@angular/core';
import { IbFormControlBase } from '..';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'ib-dynamic-form-control',
  template: ``
})

export class DynamicFormControlStubComponent {
  @Input() base: IbFormControlBase<string>;
  @Input() form: UntypedFormGroup;
}
