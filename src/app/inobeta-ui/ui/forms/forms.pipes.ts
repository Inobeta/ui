import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { IbFormArray } from './array/array';
import { IbFormControlBase } from './controls/form-control-base';
import { IbFormField } from './forms.types';

/** @deprecated */
@Pipe({
  name: 'asFormControl'
})
export class IbFormControlPipe implements PipeTransform {
  transform(value: IbFormField): IbFormControlBase<string> {
    return value as IbFormControlBase<string>;
  }
}

/** @deprecated */
@Pipe({
  name: 'asFormArray',
})
export class IbFormArrayPipe implements PipeTransform {
  transform(value: IbFormField): IbFormArray {
    return value as IbFormArray;
  }
}

/** @deprecated */
@NgModule({
  exports: [IbFormArrayPipe, IbFormControlPipe],
  declarations: [IbFormArrayPipe, IbFormControlPipe],
})
export class IbFormPipeModule { }
