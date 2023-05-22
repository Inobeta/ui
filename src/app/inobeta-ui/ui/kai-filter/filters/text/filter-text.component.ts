import { Component, forwardRef } from "@angular/core";
import { IbFilterBase } from "../base/filter-base";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IbFilterDef, IbFilterOperator } from "../../filter.types";

@Component({
  selector: "ib-filter-text",
  templateUrl: "filter-text.component.html",
  providers: [
    { provide: IbFilterBase, useExisting: forwardRef(() => IbFilterText) },
  ],
})
export class IbFilterText extends IbFilterBase {
  searchCriteria = new FormGroup({
    operator: new FormControl(null, [Validators.required]),
    value: new FormControl("", [Validators.required]),
  });

  operators = [
    {
      value: IbFilterOperator.EQUALS,
      displayValue: "shared.ibFilter.eq",
    },
    {
      value: IbFilterOperator.CONTAINS,
      displayValue: "shared.ibFilter.contains",
    },
    {
      value: IbFilterOperator.STARTS_WITH,
      displayValue: "shared.ibFilter.startsWith",
    },
    {
      value: IbFilterOperator.ENDS_WITH,
      displayValue: "shared.ibFilter.endsWith",
    },
  ];

  get displayCondition() {
    const operator = this.searchCriteria.value.operator;
    return this.operators.find((o) => o.value === operator)?.displayValue ?? "";
  }

  get displayValue() {
    return this.searchCriteria.value.value;
  }

  build = (): IbFilterDef => ({
    operator: this.searchCriteria.value.operator,
    value: this.searchCriteria.value.value,
  });

  clear() {
    this.isDirty = false;
    this.searchCriteria.markAsPristine();
    this.searchCriteria.clearValidators();
    this.searchCriteria.reset();
    this.filter.update();
  }
}
