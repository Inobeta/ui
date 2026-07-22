import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  computed,
  input,
  model,
  OnDestroy,
  OnInit,
  viewChild,
  booleanAttribute,
  inject,
} from "@angular/core";
import { MatSortModule } from "@angular/material/sort";
import {
  MatCellDef,
  MatColumnDef,
  MatFooterCellDef,
  MatHeaderCellDef,
  MatTableModule,
} from "@angular/material/table";
import { IbAggregateCell, IbCellDef } from "../cells";
import { IbSortHeader } from "../sort-header";
//import { IbTable } from "../table.component";
import { IB_COLUMN_OPTIONS, IB_TABLE, IbColumnOptions } from "../tokens";

/**
 * Column that shows any arbitrary content for the row cells.
 *
 * It requires a single element with the `*ibCellDef` directive in its template.
 *
 * By default, the name of this column will be the header text and data property accessor.
 * The header text can be overridden with the `headerText` input. Cell values can be overridden with
 * the `dataAccessor` input.
 */
@Component({
  selector: "ib-column",
  template: `
    <ng-container
      matColumnDef
      matSort
       [sticky]="stickyInput()"
       [stickyEnd]="stickyEndInput()"
    >
      <th
        class="ib-table__header-cell"
        mat-header-cell
        *matHeaderCellDef
         [ibSortHeaderFor]="matSort()"
        mat-sort-header
         [disabled]="!sortInput()"
      >
         {{ headerText() }}
      </th>
      <td mat-cell *matCellDef="let data">
        <ng-container
          *ngTemplateOutlet="
             ibCellDef()?.templateRef;
            context: { $implicit: data }
          "
        >
        </ng-container>
      </td>
      <td mat-footer-cell *matFooterCellDef></td>
    </ng-container>
  `,
  // Change detection is intentionally not set to OnPush. This component's template will be provided
  // to the table to be inserted into its view. This is problematic when change detection runs since
  // the bindings in this template will be evaluated _after_ the table's view is evaluated, which
  // mean's the template in the table's view will not have the updated value (and in fact will cause
  // an ExpressionChangedAfterItHasBeenCheckedError).
  // tslint:disable-next-line:validate-decorators
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [MatSortModule, MatTableModule, IbSortHeader, NgTemplateOutlet]
})
export class IbColumn<T> implements OnDestroy, OnInit {
  /** Column name that should be used to reference this column. */
  readonly name = model<string>("", { alias: "name" });

  /**
   * Text label that should be used for the column header. If this property is not
   * set, the header text will default to the column name with its first letter capitalized.
   */
  readonly headerText = model<string | undefined>(undefined, { alias: "headerText" });

  /**
   * Accessor function to retrieve the data rendered for each cell. If this
   * property is not set, the data cells will render the value found in the data's property matching
   * the column's name. For example, if the column is named `id`, then the rendered value will be
   * value defined by the data's `id` property.
   */
  readonly dataAccessor = model<((data: T, name: string) => number | string) | undefined>(undefined, { alias: "dataAccessor" });
  /**
   * Data accessor function that is used to retrieve data properties for sorting
   */
  readonly sortingDataAccessor = model<((data: T, name: string) => number | string) | undefined>(undefined, { alias: "sortingDataAccessor" });
  /**
   * Data accessor function that is used to retrieve data properties for filtering
   */
  readonly filterDataAccessor = model<((data: T, name: string) => number | string) | undefined>(undefined, { alias: "filterDataAccessor" });

  /**
   * Enables sorting for the column.
   */
  readonly sortInput = input(false, { transform: booleanAttribute, alias: "sort" });

  /** Whether sticky positioning should be applied. */
  readonly stickyInput = input(false, { transform: booleanAttribute, alias: "sticky" });

  /** Whether this column should be sticky positioned on the end of the row. */
  readonly stickyEndInput = input(false, { transform: booleanAttribute, alias: "stickyEnd" });

  /** Whether this column should display in the roll-up footer. */
  readonly aggregateInput = input(false, { transform: booleanAttribute, alias: "aggregate" });

  get aggregationFunction() {
    return this._table.activeDataSource().aggregatedColumns?.[this.name()];
  }

  get aggregatedData() {
    return this._table.activeDataSource().aggregatedData[this.name()];
  }

  readonly ibCellDef = contentChild(IbCellDef);

  /** @ignore */
  readonly columnDef = viewChild.required(MatColumnDef);

  /**
   * The column cell, headerCell, and footerCell are provided to the column during `ngOnInit` with a static query.
   * Normally, this will be retrieved by the column using `ContentChild`, but that assumes the
   * column definition was provided in the same view as the table, which is not the case with this
   * component.
   * @ignore
   */
  readonly cell = viewChild.required(MatCellDef);
  readonly headerCell = viewChild.required(MatHeaderCellDef);
  readonly footerCell = viewChild.required(MatFooterCellDef);

  readonly aggregateCell = viewChild(IbAggregateCell);

  readonly isActionColumnInput = input(false, { alias: 'ib-action-column', transform: booleanAttribute });

  /** @ignore */
  readonly matSort = computed(() => this._table.sort());

  _table = inject(IB_TABLE, { optional: true });
  _options: IbColumnOptions<T> =
    inject(IB_COLUMN_OPTIONS, { optional: true }) || {};

  ngOnInit() {
    this._syncColumnDefName();

    if (this.headerText() === undefined) {
      this.headerText.set(this._createDefaultHeaderText());
    }

    if (!this.dataAccessor()) {
      this.dataAccessor.set(
        this._options.defaultDataAccessor ||
        ((data: T, name: string) => (data as any)[name]));
    }

    if (!this.sortingDataAccessor()) {
      this.sortingDataAccessor.set(this.dataAccessor());
    }

    if (!this.filterDataAccessor()) {
      this.filterDataAccessor.set(this.dataAccessor());
    }

    if (this._table) {
      // Provide the cell and headerCell directly to the table with the static `ViewChild` query,
      // since the columnDef will not pick up its content by the time the table finishes checking
      // its content and initializing the rows.
       this.columnDef().cell = this.cell();
       this.columnDef().headerCell = this.headerCell();
       this.columnDef().footerCell = this.footerCell();
       this._table.matTable().addColumnDef(this.columnDef());
    }
  }

  ngOnDestroy() {
    if (this._table) {
       this._table.matTable().removeColumnDef(this.columnDef());
    }
  }

  /**
   * Creates a default header text. Use the options' header text transformation function if one
   * has been provided. Otherwise simply capitalize the column name.
   */
  _createDefaultHeaderText() {
    const name = this.name();

    if (!name) {
      throw Error(`Table column must have a name.`);
    }

    if (this._options && this._options.defaultHeaderTextTransform) {
      return this._options.defaultHeaderTextTransform(name);
    }

    return name[0].toUpperCase() + name.slice(1);
  }

  handleAggregationChange(fun: string) {
    this._table.setAggregation(this.name(), fun);
  }

  /** Synchronizes the column definition name with the text column name. */
  private _syncColumnDefName() {
    if (this.columnDef()) {
      this.columnDef().name = this.name();
    }
  }

  mobileDataRenderer(data: T, name: string): unknown {
    const value = this.dataAccessor()
      ? this.dataAccessor()(data, name)
      : (data as any)?.[name];

    return value == null ? '' : String(value);
  }
}
