import { Injectable } from '@angular/core';
import { FormControlBase } from './controls/form-control-base';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Injectable()
export class FormControlService {
  constructor() {}

  toFormGroup(fields: FormControlBase<string>[]) {
    const group: any = {};

    fields.forEach(field => {
      group[field.key] = field.required
        ? new FormControl(field.value || '', [Validators.required, ...field.validators])
        : new FormControl(field.value || '', field.validators);
    });

    return new FormGroup(group);
  }
}
