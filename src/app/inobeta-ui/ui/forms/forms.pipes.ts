import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { IbFormArray } from './array/array';
import { IbFormControlBase } from './controls/form-control-base';
import { IbFormField } from './forms.types';

@Pipe({
  name: 'asFormControl'
})
export class IbFormControlPipe implements PipeTransform {
  transform(value: IbFormField): IbFormControlBase<string> {
    return value as IbFormControlBase<string>;
  }
}

@Pipe({
  name: 'asFormArray',
})
export class IbFormArrayPipe implements PipeTransform {
  transform(value: IbFormField): IbFormArray {
    return value as IbFormArray;
  }
}

@NgModule({
  exports: [IbFormArrayPipe, IbFormControlPipe],
  declarations: [IbFormArrayPipe, IbFormControlPipe],
})
export class IbFormPipeModule { }
