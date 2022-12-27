import { Injectable } from '@angular/core';
import { IbFormControlBase } from './controls/form-control-base';
import { UntypedFormControl, Validators, UntypedFormGroup } from '@angular/forms';

@Injectable({providedIn: 'root'})
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
      group[field.key] = new UntypedFormControl(elem, validators);

    });

    return new UntypedFormGroup(group);
  }
}
