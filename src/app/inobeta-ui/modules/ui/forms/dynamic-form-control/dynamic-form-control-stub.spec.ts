import { Component, OnInit, Input } from '@angular/core';
import { FormControlBase } from '..';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'ib-dynamic-form-control',
  template: ``
})

export class DynamicFormControlStubComponent{
  @Input() base: FormControlBase<string>;
  @Input() form: FormGroup;
}
