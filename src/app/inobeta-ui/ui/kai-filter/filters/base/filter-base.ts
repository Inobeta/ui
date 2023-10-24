import { Directive, Inject, Input, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { IbFilterButton } from "../../filter-button/filter-button.component";
import { IbFilterDef } from "../../filter.types";
import { IB_FILTER } from "../../tokens";

export interface IFilterBase {
  /** Name that should be used to reference this filter. */
  name: string;
  /** Ra */
  searchCriteria: FormControl | FormGroup;

  /** Perform validation and call `filter.update()` */
  applyFilter(): void;
  /** Reset search criteria and call `filter.update()` */
  clear(): void;
  /** Build filter syntax */
  build: () => IbFilterDef;
  /**  */
  initializeFromColumn(data: any[]): void;
}

@Directive({
  selector: "ib-filter-base",
})
export class IbFilterBase implements IFilterBase {
  @ViewChild(IbFilterButton) button: IbFilterButton;

  @Input() name: string;
  @Input() set ibTableColumnName(value) {
    this.name = value;
  }

  searchCriteria: FormGroup | FormControl;

  get rawValue() {
    return this.filter?.rawFilter[this.name];
  }

  get isDirty() {
    return !!this.filter.filter[this.name]?.value;
  }

  constructor(@Inject(IB_FILTER) public filter: any) {}

  ngOnInit() {
    if (!this.name) {
      throw Error("Filter must have a name.");
    }

    this.filter.form.addControl(this.name, this.searchCriteria);
  }

  ngOnDestroy() {
    this.filter.form.removeControl(this.name);
    this.filter.update();
  }

  ngAfterViewInit() {
    this.button?.trigger.menuClosed.subscribe(() => {
      this.revertFilter();
    });
  }

  revertFilter() {
    this.searchCriteria.patchValue(this.rawValue);
  }

  build: () => IbFilterDef;

  applyFilter() {
    if (!this.searchCriteria.valid) {
      this.searchCriteria.markAllAsTouched();
      return;
    }
    this.filter?.update();
    this.closeMenu();
  }

  initializeFromColumn(data: any[]): void {}

  clear() {
    this.searchCriteria.markAsPristine();
    this.searchCriteria.clearValidators();
    this.searchCriteria.reset();
    this.filter?.update();
  }

  closeMenu() {
    this.button?.closeMenu();
  }
}
