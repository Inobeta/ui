import { Component, Input, ViewEncapsulation, forwardRef } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { IbFilterDef } from "../../filter.types";
import { and, gte, lte, none } from "../../filters";
import { IbFilterBase } from "../base/filter-base";

@Component({
  selector: "ib-number-filter",
  templateUrl: "filter-number.component.html",
  styleUrls: ["./filter-number.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: IbFilterBase, useExisting: forwardRef(() => IbNumberFilter) },
  ],
})
export class IbNumberFilter extends IbFilterBase {
  @Input() min: number = 0;
  @Input() max: number = 100;

  searchCriteria = new FormGroup({
    min: new FormControl(),
    max: new FormControl(),
  });

  get displayLabelParams() {
    return {
      min: this.rawValue.min,
      max: this.rawValue.max,
    };
  }

  ngOnInit() {
    super.ngOnInit();
    if (this.filter?.ibTable) {
      this.defineRangeFromColumn();
    }

    this.clearRange();
  }

  defineRangeFromColumn() {
    const values = this.filter.ibTable.dataSource.data.map((x) => x[this.name]);
    this.min = Math.min(...values);
    this.max = Math.max(...values);
  }

  clear(update = true) {
    this.clearRange();
    update && this.filter.update();
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
