import { Injectable } from '@angular/core';
import { IbFormControlBase } from './controls/form-control-base';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Injectable()
export class IbFormControlService {
  constructor() {}

  toFormGroup(fields: IbFormControlBase<any>[]) {
    const group: any = {};

    fields.forEach(field => {
      if(!field.key) return;
      const elem = {
        value: (field.value === undefined) ? null : field.value,
        disabled: field.disabled
      }
      let validators = []
      if(field.validators && field.validators.length){
        validators = validators.concat(field.validators)
      }
      if(field.required){
        validators.push(Validators.required)
      }
      group[field.key] = new FormControl(elem, validators);

    });

    return new FormGroup(group);
  }
}
