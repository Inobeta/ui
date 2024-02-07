import { Directive, Inject, Input, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { IbFilterButton } from "../../filter-button/filter-button.component";
import { IbFilterDef } from "../../filter.types";
import { IB_FILTER } from "../../tokens";
import { takeUntil } from "rxjs/operators";

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
  build(): IbFilterDef;
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
    const value = this.filter.filter[this.name]?.value;
    return value != null || value != undefined;
  }

  protected _destroyed = new Subject<void>();

  constructor(@Inject(IB_FILTER) public filter: any) {}

  ngOnInit() {
    if (!this.name) {
      throw Error("Filter must have a name.");
    }

    if (!this.searchCriteria) {
      throw Error(`Filter ${this.name} has no search criteria`);
    }

    this.filter.form.addControl(this.name, this.searchCriteria);
  }

  ngAfterViewInit() {
    this.button?.trigger.menuClosed
      .pipe(takeUntil(this._destroyed))
      .subscribe(() => {
        this.revertFilter();
      });
  }

  ngOnDestroy() {
    this.filter.form.removeControl(this.name);
    this.filter.update();
    this._destroyed.next();
    this._destroyed.complete();
  }

  revertFilter() {
    this.searchCriteria.patchValue(this.rawValue);
  }

  build(): IbFilterDef {
    throw Error(`Filter ${this.name} has no build method defined.`);
  }

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
