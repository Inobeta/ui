import {
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Optional,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ReplaySubject } from "rxjs";
import { IbKaiTableAction } from "../kai-table/action";
import { IbFilterSyntax, IbFilterSyntaxExtended } from "./filter.types";
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
        @if (list.children.length > 1) {
          <mat-icon>filter_list</mat-icon>
        }
        <ng-content></ng-content>
      </section>
    </section>

    <button
      *ibTableAction
      matMiniFab
      style="margin-left: 5px;"
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
  standalone: false,
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
  set value(value: IbFilterSyntaxExtended) {
    if (!value) {
      return;
    }

    // as indicated in NG01000
    setTimeout(() => {
      this.form.patchValue(value);
      this.update();
    });
  }

  get value(): IbFilterSyntaxExtended {
    return this._value;
  }

  private _value: IbFilterSyntaxExtended = {};

  @Output() ibFilterUpdated = new EventEmitter<IbFilterSyntaxExtended>();
  @Output() ibQueryUpdated = new EventEmitter<Record<string, any>>();

  form: FormGroup = new FormGroup({});

  initialRawValue: IbFilterSyntaxExtended = {};
  get selectedCriteria() {
    return this.form.getRawValue();
  }
  query: Record<string, any> = {};

  hideFilters = false;

  initialized = new ReplaySubject<void>(1);
  constructor(@Optional() public templateRef: TemplateRef<any>) { }
  ngOnInit() {
  }

  ngAfterViewInit() {
    this.initialRawValue = this.form.getRawValue();
    this._markInitialized();
  }

  update() {
    this._computeValues();
    this.ibFilterUpdated.emit(this._value);
    this.ibQueryUpdated.emit(this.query);
  }

  /**
   * Silently hydrates raw form values from a canonical source (e.g., URL, NgRx)
   * without emitting {@link ibFilterUpdated} or {@link ibQueryUpdated}.
   *
   * @param value Serialized raw filter criteria, or `null` to clear all filters.
   */
  hydrateRawValue(value: IbFilterSyntaxExtended | null): void {
    if (value === null) {
      this.form.reset(undefined, { emitEvent: false });
      // A reset form still builds each registered filter's inactive value
      // (for example, a number range or a date period). Those values must
      // not be retained as canonical criteria when the snapshot explicitly
      // requests no filters.
      this._value = {};
      this.query = this.toQuery();
      return;
    } else {
      this.form.patchValue(value, { emitEvent: false });
    }
    this._computeValues();
  }

  private _computeValues(): void {
    this._value = this.buildFilter();
    this.query = this.toQuery();
  }

  reset() {
    this.form.reset();
    this.update();
  }

  toQuery() {
    let output = {};
    const filters = this.filters?.toArray() ?? [];

    for (const filter of filters) {
      output[filter.name] = filter.toQuery();
    }

    return output;
  }

  /** @ignore */
  private buildFilter(): IbFilterSyntax {
    let output = {};
    const filters = this.filters?.toArray() ?? [];

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
