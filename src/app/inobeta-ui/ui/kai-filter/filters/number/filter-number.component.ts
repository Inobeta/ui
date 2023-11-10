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

  slider = new FormGroup({
    min: new FormControl(this.min, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    max: new FormControl(this.max, {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  searchCriteria = new FormControl(none(), { nonNullable: true });

  get displayLabelParams() {
    return {
      min: this.rawValue?.value?.[0]?.value,
      max: this.rawValue?.value?.[1]?.value,
    };
  }

  ngOnInit() {
    this.searchCriteria.reset = () => {
      this.searchCriteria.setValue(none());
      this.clearRange();
    };
    this.searchCriteria.valueChanges.subscribe((values) => {
      if (values.operator === 0) {
        this.clearRange();
        return;
      }
      this.slider.setValue({
        min: values.value?.[0]?.value,
        max: values.value?.[1]?.value,
      });
    });
    this.clearRange();
    super.ngOnInit();
  }

  initializeFromColumn(data: any[]): void {
    if (!data.length) {
      return;
    }
    const values = data.map((x) => x[this.name]);
    this.min = Math.min(...values);
    this.max = Math.max(...values);
    if (!this.isDirty) {
      this.clearRange();
    }
  }

  applyFilter(): void {
    if (!this.slider.valid) {
      this.slider.markAllAsTouched();
      return;
    }
    this.searchCriteria.setValue(this.build());
    this.filter.update();
    this.button.closeMenu();
  }

  clear() {
    this.searchCriteria.setValue(none());
    this.clearRange();
    this.filter.update();
  }

  clearRange() {
    this.slider.setValue({
      min: this.min,
      max: this.max,
    });
  }

  build = (): IbFilterDef => {
    if (
      this.slider.value.min === this.min &&
      this.slider.value.max === this.max
    ) {
      return none();
    }

    return and([gte(this.slider.value.min), lte(this.slider.value.max)]);
  };
}
