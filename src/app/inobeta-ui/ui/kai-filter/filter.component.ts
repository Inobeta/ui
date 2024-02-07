import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { IbKaiTableAction } from "../kai-table/action";
import { IbFilterSyntax } from "./filter.types";
import { IbFilterBase } from "./filters/base/filter-base";
import { IB_FILTER } from "./tokens";

@Component({
  selector: "ib-filter",
  template: `
    <section
      class="ib-filter"
      [class.ib-filter--hidden]="hideFilters"
      [attr.aria-hidden]="hideFilters"
    >
      <ng-content select="ib-search-bar"></ng-content>
      <section #list class="ib-filter__list">
        <mat-icon *ngIf="list.children.length > 1">filter_list</mat-icon>
        <ng-content></ng-content>
      </section>
    </section>

    <button
      *ibTableAction
      mat-icon-button
      [matTooltip]="'shared.ibTableView.showFilters' | translate"
      (click)="hideFilters = !hideFilters"
    >
      <mat-icon>{{ !hideFilters ? "filter_alt" : "filter_alt_off" }}</mat-icon>
    </button>
  `,
  styleUrls: ["./filter.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: IB_FILTER, useExisting: IbFilter }],
})
export class IbFilter {
  /** @ignore */
  @ContentChildren(IbFilterBase)
  filters: QueryList<IbFilterBase>;

  /** @ignore */
  @ViewChild(IbKaiTableAction) hideFilterAction: IbKaiTableAction;

  /**
   * Manually sets a filter
   *
   * @example
   * { category: ['pants'] }
   * */
  @Input()
  set value(value: Record<string, any>) {
    if (!value) {
      return;
    }

    // as indicated in NG01000
    setTimeout(() => {
      this.form.patchValue(value);
      this.update();
    });
  }
  @Output() ibFilterUpdated = new EventEmitter<IbFilterSyntax>();
  @Output() ibRawFilterUpdated = new EventEmitter<Record<string, any>>();

  /** @ignore */
  form: FormGroup = new FormGroup<Record<string, any>>({});

  initialRawValue: Record<string, any> = {};
  rawFilter: Record<string, any> = {};
  filter: IbFilterSyntax = {};

  hideFilters = false;

  ngAfterViewInit() {
    this.initialRawValue = this.rawFilter = this.form.getRawValue();
  }

  update() {
    this.rawFilter = this.form.getRawValue();
    this.filter = this.buildFilter();
    this.ibFilterUpdated.emit(this.filter);
    this.ibRawFilterUpdated.emit(this.rawFilter);
  }

  reset() {
    this.form.reset();
    this.form.patchValue(this.initialRawValue);
    this.update();
  }

  /** @ignore */
  private buildFilter(): IbFilterSyntax {
    let output = {};
    const filters = this.filters.toArray();

    for (const filter of filters) {
      output[filter.name] = filter.build();
    }

    return output;
  }
}
