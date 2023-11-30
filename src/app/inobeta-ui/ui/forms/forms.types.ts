import { IbFormArray } from "./array/array";
import { IbFormControlBase } from "./controls/form-control-base";

export type IbFormField<T> = IbFormControlBase<T> | IbFormArray;