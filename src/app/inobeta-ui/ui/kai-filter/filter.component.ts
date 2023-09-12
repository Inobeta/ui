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
import { IbFilterDef, IbFilterSyntax } from "./filter.types";
import { applyFilter } from "./filters";
import { IbFilterBase } from "./filters/base/filter-base";
import { IbKaiTableAction } from "../kai-table/action";

@Component({
  selector: "ib-filter",
  template: `
    <section class="ib-filter" [class.ib-filter__hide]="hideFilters" [attr.aria-hidden]="hideFilters">
      <ng-content select="ib-search-bar"></ng-content>
      <section #list class="ib-filter-list">
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
      Object.keys(value).forEach((key) => this.form.get(key).markAsDirty());
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
    this.initialRawValue = this.rawFilter = this.form.value;
  }

  update() {
    this.rawFilter = this.form.value;
    this.filter = this.buildFilter();
    this.ibFilterUpdated.emit(this.filter);
    this.ibRawFilterUpdated.emit(this.rawFilter);
  }

  reset() {
    this.form.reset();
    this.update();
  }

  /** @ignore */
  filterPredicate = (data: any, filter: IbFilterSyntax | any) => {
    const matchesSearchBar = this.applySearchBarFilter(
      data,
      filter?.__ibSearchBar
    );
    return Object.entries(data).every(([key, value]) => {
      const condition = filter[key];
      return applyFilter(condition, value) && matchesSearchBar;
    });
  };

  /** @ignore */
  private buildFilter(): IbFilterSyntax {
    let output = {};
    const filters = this.filters.toArray();

    for (const key of Object.keys(this.rawFilter)) {
      const filter = filters.find((f) => f.name === key);
      output = { ...output, [key]: filter.build() };
    }

    return output;
  }

  /** @ignore */
  private applySearchBarFilter = (data: any, filter: IbFilterDef) => {
    if (!filter) {
      return true;
    }

    const dataStr = Object.keys(data as unknown as Record<string, any>)
      .reduce((currentTerm: string, key: string) => {
        // https://github.com/angular/components/blob/main/src/material/table/table-data-source.ts#L247
        return (
          currentTerm + (data as unknown as Record<string, any>)[key] + "◬"
        );
      }, "")
      .toLowerCase();

    return applyFilter(filter, dataStr);
  };
}
