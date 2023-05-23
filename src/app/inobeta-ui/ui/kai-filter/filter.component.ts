import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Optional,
  Output,
  QueryList,
  ViewEncapsulation,
  forwardRef,
} from "@angular/core";
import { applyFilter, contains } from "./filters";
import { FormGroup } from "@angular/forms";
import { IbTable } from "../kai-table/table.component";
import { IbFilterBase } from "./filters/base/filter-base";
import { IbFilterSyntax } from "./filter.types";

@Component({
  selector: "ib-filter",
  template: `
    <mat-form-field style="width: 100%; padding-bottom: 0">
      <mat-icon matPrefix>search</mat-icon>
      <input
        matInput
        [(ngModel)]="searchBar"
        (ngModelChange)="update()"
        [placeholder]="'shared.ibFilter.search' | translate"
      />
      <mat-icon
        matSuffix
        matBadgeSize="small"
        (click)="showFilters = !showFilters; $event.stopPropagation()"
        >filter_list</mat-icon
      >
    </mat-form-field>
    <section class="ib-filter-list" [class.ib-filter-list__show]="showFilters">
      <ng-content></ng-content>
    </section>
  `,
  styleUrls: ["./filter.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class IbFilter {
  @ContentChildren(forwardRef(() => IbFilterBase))
  filters: QueryList<IbFilterBase>;

  @Input()
  set value(value) {
    // as indicated in NG01000
    setTimeout(() => {
      this.form.patchValue(value);
      Object.keys(value).forEach((key) => this.form.get(key).markAsDirty());
      this.update();
    });
  }
  @Output() ibFilterUpdated = new EventEmitter<IbFilterSyntax>();

  form: FormGroup = new FormGroup<Record<string, any>>({});

  showFilters = true;
  searchBar = "";

  rawFilter: Record<string, any> = {};
  filter: IbFilterSyntax = {};

  constructor(@Optional() public ibTable: IbTable) {}

  update() {
    this.rawFilter = this.form.value;
    this.filter = this.buildFilter();
    this.ibFilterUpdated.emit(this.filter);
  }

  private reset() {
    this.ibFilterUpdated.emit({});
  }

  // where the **** should i put this...
  filterPredicate = (data: any, filter: IbFilterSyntax | any) => {
    return Object.entries(data).every(([key, value]) => {
      const condition = filter[key];
      return (
        applyFilter(condition, value) &&
        this.evaluateCrossColumnFilter(data, filter)
      );
    });
  };

  buildFilter() {
    let output = {};
    const filters = this.filters.toArray();

    if (this.searchBar) {
      output = {
        __crossColumnFilter: contains(this.searchBar),
      };
    }

    for (const key of Object.keys(this.rawFilter)) {
      const filter = filters.find((f) => f.name === key);
      // if (filter.searchCriteria.invalid) {
      //   filter.clear(false);
      //   continue;
      // }
      output = { ...output, [key]: filter.build() };
    }

    return output;
  }

  private evaluateCrossColumnFilter = (
    data: any,
    filter: Record<string, any>
  ) => {
    if (!("__crossColumnFilter" in filter)) {
      return true;
    }

    if (!filter?.__crossColumnFilter) {
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

    return applyFilter(filter.__crossColumnFilter, dataStr);
  };
}
