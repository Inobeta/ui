import { Injectable } from "@angular/core";
import { IbFormControlBase } from "./controls/form-control-base";
import {
  UntypedFormControl,
  Validators,
  UntypedFormGroup,
  UntypedFormArray,
} from "@angular/forms";
import { IbFormField } from "./forms.types";
import { IbFormArray } from "./array/array";

@Injectable({ providedIn: "root" })
export class IbFormControlService {
  constructor() {}

  toFormGroup(fields: IbFormField<any>[]) {
    const group = new UntypedFormGroup({});

    for (const field of fields) {
      if (!field.key) {
        continue;
      }
      
      if (field instanceof IbFormControlBase) {
        group.addControl(field.key, this.toControl(field))
      }

      if (field instanceof IbFormArray) {
        group.addControl(field.key, this.toFormArray(field));
      }
    }

    return group;
  }

  toControl(field: IbFormControlBase<any>) {
    const elem = {
      value: field.value === undefined ? null : field.value,
      disabled: field.disabled,
    };
    let validators = [];
    if (field.validators && field.validators.length) {
      validators = validators.concat(field.validators);
    }
    if (field.required) {
      validators.push(Validators.required);
    }
    return new UntypedFormControl(elem, validators)
  }

  toFormArray(source: IbFormArray) {
    const formArray = new UntypedFormArray([]);
    
    // for (const field of source.fields) {
    //   if (!field.key) {
    //     continue;
    //   }
      
    //   if (field instanceof IbFormControlBase) {
    //     formArray.push(this.toControl(field));
    //   }

    //   if (field instanceof IbFormArray) {
    //     formArray.push(this.toFormArray(field));
    //   }
    // }
    
    return formArray;
  }
}
