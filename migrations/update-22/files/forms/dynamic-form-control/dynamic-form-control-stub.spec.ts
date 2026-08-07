import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { IbFormControlBase } from '..';
import { UntypedFormGroup } from '@angular/forms';

@Component({
    selector: 'ib-dynamic-form-control',
    template: ``,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class DynamicFormControlStubComponent {
  @Input() base: IbFormControlBase<string>;
  @Input() form: UntypedFormGroup;
}
