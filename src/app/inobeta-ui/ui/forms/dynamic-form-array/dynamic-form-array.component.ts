import { Component, Input } from "@angular/core";
import { UntypedFormArray, UntypedFormGroup } from "@angular/forms";
import { IbFormArray } from "../array/array";
import { IbFormControlService } from "../form-control.service";

/** @deprecated */
@Component({
  selector: "ib-dynamic-form-array",
  templateUrl: "dynamic-form-array.component.html",
})
export class IbDynamicFormArrayComponent {
  @Input() base: IbFormArray;
  @Input() form: UntypedFormGroup;

  constructor(private cs: IbFormControlService) {}

  get array() {
    return this.form.get(this.base.key) as UntypedFormArray;
  }

  get max() {
    return this.base.options.max;
  }

  get lines() {
    return this.array.controls.length;
  }

  getGroupAt(index: number) {
    return this.array.at(index) as UntypedFormGroup;
  }

  addField() {
    this.array.push(this.cs.toFormGroup(this.base.fields));
    this.base.addRow(this.array, this.lines)
  }

  removeField(index: number) {
    const removedData = structuredClone(this.getGroupAt(index)?.getRawValue())
    this.array.removeAt(index);
    this.base.removeRow(this.array, this.lines, index, removedData);
  }
}
