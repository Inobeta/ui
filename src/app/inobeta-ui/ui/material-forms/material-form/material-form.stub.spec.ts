import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { IbFormControlBase } from '../../forms/controls/form-control-base';
import { IbFormAction } from '../../forms/dynamic-form/dynamic-form.component';
import { IbMatActionsPosition } from './material-form.component';

@Component({
  selector: 'ib-material-form',
  template: ``,
})
export class IbMaterialFormStubComponent {
  @Input() fields: IbFormControlBase<string>[] = [];
  @Input() actions: IbFormAction[] = [];
  @Input() actionsPosition = IbMatActionsPosition.BOTTOM;
  @Input() disabledOnInit = false;
  @Output() ibSubmit = new EventEmitter<any>();
  form: UntypedFormGroup;

  constructor() {
  }

  ngOnInit() {
    this.form = this.toFormGroup(this.fields);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const fields = changes['fields'];
    if (fields && !fields.isFirstChange()) {
      this.form = this.toFormGroup(fields.currentValue);
    }
  }

  afterChanges(){
    return of(this.toFormGroup(this.fields))
  }

  toFormGroup(fields: IbFormControlBase<any>[]) {
    const group: any = {};

    fields.forEach(field => {
      const elem = {
        value: field.value || '',
        disabled: field.disabled
      };
      let validators = [];
      if (field.validators && field.validators.length) {
        validators = validators.concat(field.validators);
      }
      if (field.required) {
        validators.push(Validators.required);
      }
      group[field.key] = new UntypedFormControl(elem, validators);

    });

    return new UntypedFormGroup(group);
  }
}
