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
import { HasInitialized } from "@angular/material/core";
import { ReplaySubject } from "rxjs";
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
      [color]="!hideFilters ? 'primary' : ''"
      (click)="hideFilters = !hideFilters"
    >
      <mat-icon>{{ "filter_alt" }}</mat-icon>
    </button>
  `,
  styleUrls: ["./filter.component.scss"],
  encapsulation: ViewEncapsulation.None,
  providers: [{ provide: IB_FILTER, useExisting: IbFilter }],
})
export class IbFilter implements HasInitialized {
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

  get value(): IbFilterSyntax {
    return this._value;
  }

  private _value: IbFilterSyntax = {};

  @Output() ibFilterUpdated = new EventEmitter<IbFilterSyntax>();
  @Output() ibQueryUpdated = new EventEmitter<Record<string, any>>();

  /** @ignore */
  form: FormGroup = new FormGroup<Record<string, any>>({});

  initialRawValue: Record<string, any> = {};
  selectedCriteria: Record<string, any> = {};
  query: Record<string, any> = {};

  hideFilters = false;

  initialized = new ReplaySubject<void>(1);

  ngOnInit() {
    this._markInitialized();
  }

  ngAfterViewInit() {
    this.initialRawValue = this.selectedCriteria = this.form.getRawValue();
  }

  update() {
    this.selectedCriteria = this.form.getRawValue();
    this._value = this.buildFilter();
    this.query = this.toQuery();
    this.ibFilterUpdated.emit(this._value);
    this.ibQueryUpdated.emit(this.query);
  }

  reset() {
    this.form.reset();
    // this.form.patchValue(this.initialRawValue);
    this.update();
  }

  toQuery() {
    let output = {};
    const filters = this.filters.toArray();

    for (const filter of filters) {
      output[filter.name] = filter.toQuery();
    }

    return output;
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

  _markInitialized() {
    this.initialized.next();
    this.initialized.complete();
  }
}
