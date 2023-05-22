import {
  Directive,
  Input,
  ViewChild,
} from "@angular/core";
import { IbFilter } from "../../filter.component";
import { FormControl, FormGroup } from "@angular/forms";
import { IbFilterDef, _IbFilterBase } from "../../filter.types";
import { IbFilterButton } from "../../filter-button/filter-button.component";

@Directive({
  selector: "ib-filter-base",
})
export abstract class IbFilterBase implements _IbFilterBase {
  @ViewChild(IbFilterButton) button: IbFilterButton;

  @Input() name: string;
  @Input() set ibTableColumnName(value) {
    this.name = value;
  }

  isDirty = false;
  searchCriteria: FormGroup | FormControl;

  constructor(public filter: IbFilter) {}

  ngOnInit() {
    if (!this.name) {
      return;
    }

    this.filter.form.addControl(this.name, this.searchCriteria);
  }

  applyFilter() {
    if (!this.searchCriteria.valid) {
      this.searchCriteria.markAllAsTouched();
      return;
    }
    this.isDirty = true;
    this.filter.update();
    this.closeMenu();
  }

  clear() {
    this.isDirty = false;

    this.searchCriteria.markAsPristine();
    this.searchCriteria.clearValidators();
    this.searchCriteria.reset();
    this.filter.update();
  }

  closeMenu() {
    this.button.closeMenu();
  }
  
  abstract build: () => IbFilterDef;
}
