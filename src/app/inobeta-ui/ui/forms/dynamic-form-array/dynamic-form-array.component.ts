import { Component, Input, OnInit } from "@angular/core";
import { UntypedFormArray, UntypedFormGroup } from "@angular/forms";
import { IbFormArray } from "../array/array";
import { IbFormControlService } from "../form-control.service";
import { IbFormField } from "../forms.types";

@Component({
  selector: "ib-dynamic-form-array",
  templateUrl: "dynamic-form-array.component.html",
})
export class IbDynamicFormArrayComponent implements OnInit {
  lines: IbFormField<any>[][] = [];
  @Input() base: IbFormArray;
  @Input() form: UntypedFormGroup | UntypedFormArray;

  constructor(private cs: IbFormControlService) {}

  ngOnInit() {
    this.addField()
  }

  get array() {
    return this.form.get(this.base.key) as UntypedFormArray;
  }

  getGroupAt(index: number) {
    return this.array.at(index);
  }

  addField() {
    this.array.push(this.cs.toFormGroup(this.base.fields));
    this.lines.push(this.base.fields.concat());
  }

  removeField(index: number) {
    this.array.removeAt(index);
    this.lines.splice(index, 1);
  }
}
