import { Component, Input, OnInit } from "@angular/core";
import { UntypedFormArray, UntypedFormGroup } from "@angular/forms";
import { IbFormArray } from "../array/array";
import { IbFormControlService } from "../form-control.service";

@Component({
  selector: "ib-dynamic-form-array",
  templateUrl: "dynamic-form-array.component.html",
})
export class IbDynamicFormArrayComponent implements OnInit {
  @Input() base: IbFormArray;
  @Input() form: UntypedFormGroup;

  constructor(private cs: IbFormControlService) {}

  ngOnInit() {
    this.addField();
  }

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
  }

  removeField(index: number) {
    this.array.removeAt(index);
  }
}
