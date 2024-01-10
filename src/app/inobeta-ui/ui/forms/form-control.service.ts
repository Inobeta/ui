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

  toFormGroup(fields: IbFormField[]) {
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
    const patchValue = formArray.patchValue;
    formArray.patchValue = (value: any[], options) => {
      formArray.controls = [];
      let i = Math.min(Math.max(value.length, 0), source.options.max);
      console.log(i)
      while (i--) {
        formArray.push(this.toFormGroup(source.fields));
      }
      patchValue.call(formArray, value, options);
    }
    return formArray;
  }
}
