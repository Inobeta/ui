import { Component, forwardRef } from "@angular/core";
import { IbFilterBase } from "../base/filter-base";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IbFilterDef, IbFilterOperator } from "../../filter.types";
import { none } from "../../filters";

@Component({
  selector: "ib-text-filter",
  templateUrl: "filter-text.component.html",
  providers: [
    { provide: IbFilterBase, useExisting: forwardRef(() => IbTextFilter) },
  ],
})
export class IbTextFilter extends IbFilterBase {
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

  get isDirty() {
    return this.searchCriteria.valid;
  }

  get displayCondition() {
    const operator = this.searchCriteria.value.operator;
    return this.operators.find((o) => o.value === operator)?.displayValue ?? "";
  }

  get displayValue() {
    return this.searchCriteria.value.value;
  }

  build = (): IbFilterDef => {
    if (this.searchCriteria.invalid) {
      return none();
    }
    
    return ({
      operator: this.searchCriteria.value.operator,
      value: this.searchCriteria.value.value,
    });
  };
}
