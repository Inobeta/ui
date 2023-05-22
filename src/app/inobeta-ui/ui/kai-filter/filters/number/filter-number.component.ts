import { Component, Input, ViewEncapsulation, forwardRef } from "@angular/core";
import { IbFilterBase } from "../base/filter-base";
import { FormControl, FormGroup } from "@angular/forms";
import { IbFilterDef, _IbFilterBase } from "../../filter.types";
import { and, gte, lte } from "../../filters";

@Component({
  selector: "ib-filter-number",
  templateUrl: "filter-number.component.html",
  styleUrls: ["./filter-number.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [
    { provide: IbFilterBase, useExisting: forwardRef(() => IbFilterNumber) },
  ],
})
export class IbFilterNumber extends IbFilterBase {
  @Input() min: number = 0;
  @Input() max: number = 100;

  searchCriteria = new FormGroup({
    min: new FormControl(),
    max: new FormControl(),
  });

  ngOnInit() {
    super.ngOnInit();
    if (this.filter?.ibTable) {
      this.defineRangeFromColumn();
    }
  }

  defineRangeFromColumn() {
    const values = this.filter.ibTable.dataSource.data.map((x) => x[this.name]);
    this.min = Math.min(...values);
    this.max = Math.max(...values);

    this.clearRange();
  }

  clear() {
    this.isDirty = false;
    this.clearRange();
    this.filter.update();
  }

  clearRange() {
    this.searchCriteria.setValue({
      min: this.min,
      max: this.max,
    });
  }

  build = (): IbFilterDef =>
    and([
      gte(this.searchCriteria.value.min),
      lte(this.searchCriteria.value.max),
    ]);
}
