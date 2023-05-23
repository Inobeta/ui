import { Directive, Input, ViewChild } from "@angular/core";
import { IbFilter } from "../../filter.component";
import { FormControl, FormGroup } from "@angular/forms";
import { IbFilterDef } from "../../filter.types";
import { IbFilterButton } from "../../filter-button/filter-button.component";

export abstract class _IbFilterBase {
  button: IbFilterButton;

  name: string;
  set ibTableColumnName(value) {
    this.name = value;
  }

  get isDirty() {
    return this.searchCriteria.dirty;
  }

  searchCriteria: FormGroup | FormControl;

  constructor(public filter: IbFilter) {}

  applyFilter() {
    if (!this.searchCriteria.valid) {
      this.searchCriteria.markAllAsTouched();
      return;
    }
    this.filter.update();
    this.closeMenu();
  }

  clear(update = true) {
    this.searchCriteria.markAsPristine();
    this.searchCriteria.clearValidators();
    this.searchCriteria.reset();
    update && this.filter.update();
  }

  closeMenu() {
    this.button.closeMenu();
  }

  abstract build: () => IbFilterDef;
}

@Directive({
  selector: "ib-filter-base",
})
export class IbFilterBase extends _IbFilterBase {
  @ViewChild(IbFilterButton) button: IbFilterButton;

  @Input() name: string;
  @Input() set ibTableColumnName(value) {
    this.name = value;
  }

  constructor(public filter: IbFilter) {
    super(filter);
  }

  ngOnInit() {
    if (!this.name) {
      return;
    }

    this.filter.form.addControl(this.name, this.searchCriteria);
  }

  build: () => IbFilterDef;
}
