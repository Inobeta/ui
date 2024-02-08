import { Component } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IbFilterDef, IbFilterOperator, IbTextQuery } from "../../filter.types";
import { none } from "../../filters";
import { IbFilterBase } from "../base/filter-base";

@Component({
  selector: "ib-text-filter",
  templateUrl: "filter-text.component.html",
  providers: [{ provide: IbFilterBase, useExisting: IbTextFilter }],
})
export class IbTextFilter extends IbFilterBase {
  searchCriteria = new FormGroup({
    operator: new FormControl<IbFilterOperator>(IbFilterOperator.CONTAINS, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    value: new FormControl(null, { nonNullable: true }),
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
    const operator = this.rawValue.operator;
    return this.operators.find((o) => o.value === operator)?.displayValue;
  }

  get displayValue() {
    return this.rawValue.value;
  }

  clear(): void {
    this.searchCriteria.setValue({
      operator: IbFilterOperator.CONTAINS,
      value: "",
    });
    this.filter?.update();
  }

  build(): IbFilterDef {
    if (!this.searchCriteria.value.value) {
      return none();
    }

    return {
      operator: this.searchCriteria.value.operator,
      value: this.searchCriteria.value.value,
    };
  }

  toQuery(): IbTextQuery {
    const value = this.searchCriteria.value.value;
    if (!value) {
      return;
    }

    const operator = this.searchCriteria.value.operator;
    let q: IbTextQuery;
    switch (operator) {
      case IbFilterOperator.CONTAINS:
        q = {
          regex: `/.*${value}.*/`,
          like: `%${value}%`,
        };
        break;
      case IbFilterOperator.STARTS_WITH:
        q = {
          regex: `/^${value}.*/`,
          like: `%${value}`,
        };
    }
    return q;
  }
}
