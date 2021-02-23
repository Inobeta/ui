import { Injectable } from '@angular/core';
import { IbFormControlBase } from './controls/form-control-base';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Injectable()
export class IbFormControlService {
  constructor() {}

  toFormGroup(fields: IbFormControlBase<string>[]) {
    const group: any = {};

    fields.forEach(field => {
      group[field.key] = field.required
        ? new FormControl(field.value || '', [Validators.required, ...field.validators])
        : new FormControl(field.value || '', field.validators);
    });

    return new FormGroup(group);
  }
}
