import { Injectable } from '@angular/core';
import { IbFormControlBase } from './controls/form-control-base';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Injectable()
export class IbFormControlService {
  constructor() {}

  toFormGroup(fields: IbFormControlBase<any>[]) {
    const group: any = {};

    fields.forEach(field => {
      const elem = {
        value: field.value || '',
        disabled: field.disabled
      }
      const validators = []
      if(field.validators){
        validators.concat(field.validators)
      }
      if(field.required){
        validators.push(Validators.required)
      }
      group[field.key] = new FormControl(elem, validators);

    });

    return new FormGroup(group);
  }
}
