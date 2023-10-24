import { Component, Input, ViewEncapsulation } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IbFilterDef } from "../../filter.types";
import { and, gte, lte, none } from "../../filters";
import { IbFilterBase } from "../base/filter-base";

@Component({
  selector: "ib-number-filter",
  templateUrl: "filter-number.component.html",
  styleUrls: ["./filter-number.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: IbFilterBase, useExisting: IbNumberFilter }],
})
export class IbNumberFilter extends IbFilterBase {
  @Input() min: number = 0;
  @Input() max: number = 100;
  @Input() step: number = 1;

  searchCriteria = new FormGroup({
    min: new FormControl(this.min, { nonNullable: true }),
    max: new FormControl(this.max, { nonNullable: true }),
  });

  get displayLabelParams() {
    return {
      min: this.rawValue.min,
      max: this.rawValue.max,
    };
  }

  ngOnInit() {
    super.ngOnInit();
    this.clearRange();
  }

  initializeFromColumn(data: any[]): void {
    const values = data.map((x) => x[this.name]);
    this.min = Math.min(...values);
    this.max = Math.max(...values);
    this.clearRange();
  }

  clear() {
    this.clearRange();
    this.filter.update();
  }

  clearRange() {
    this.searchCriteria.setValue({
      min: this.min,
      max: this.max,
    });
  }

  build = (): IbFilterDef => {
    if (
      this.searchCriteria.value.min === this.min &&
      this.searchCriteria.value.max === this.max
    ) {
      return none();
    }

    return and([
      gte(this.searchCriteria.value.min),
      lte(this.searchCriteria.value.max),
    ]);
  };
}
