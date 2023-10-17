import { BooleanInput, coerceBooleanProperty } from "@angular/cdk/coercion";
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from "@angular/core";
import {
  MatCellDef,
  MatColumnDef,
  MatFooterCellDef,
  MatHeaderCellDef,
} from "@angular/material/table";
import { merge } from "rxjs";
import { IbAggregateCell, IbCellDef } from "../cells";
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
      [sticky]="sticky"
      [stickyEnd]="stickyEnd"
    >
      <th
        class="ib-table__header-cell"
        mat-header-cell
        *matHeaderCellDef
        [ibSortHeaderFor]="matSort"
        mat-sort-header
        [disabled]="!sort"
      >
        {{ headerText }}
      </th>
      <td mat-cell *matCellDef="let data">
        <ng-container
          *ngTemplateOutlet="
            ibCellDef.templateRef;
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
})
export class IbColumn<T> implements OnDestroy, OnInit {
  /** Column name that should be used to reference this column. */
  @Input()
  get name(): string {
    return this._name;
  }
  set name(name: string) {
    this._name = name;

    // With Ivy, inputs can be initialized before static query results are
    // available. In that case, we defer the synchronization until "ngOnInit" fires.
    this._syncColumnDefName();
  }
  _name: string;

  /**
   * Text label that should be used for the column header. If this property is not
   * set, the header text will default to the column name with its first letter capitalized.
   */
  @Input() headerText: string;

  /**
   * Accessor function to retrieve the data rendered for each cell. If this
   * property is not set, the data cells will render the value found in the data's property matching
   * the column's name. For example, if the column is named `id`, then the rendered value will be
   * value defined by the data's `id` property.
   */
  @Input() dataAccessor: (data: T, name: string) => string;

  /**
   * Enables sorting for the column.
   */
  @Input()
  get sort() {
    return this._sort;
  }
  set sort(value: BooleanInput) {
    this._sort = coerceBooleanProperty(value);
  }
  private _sort = false;

  /** Whether sticky positioning should be applied. */
  @Input()
  get sticky() {
    return this._sticky;
  }
  set sticky(value: BooleanInput) {
    this._sticky = coerceBooleanProperty(value);
  }
  private _sticky = false;

  /** Whether this column should be sticky positioned on the end of the row. */
  @Input()
  get stickyEnd() {
    return this._stickyEnd;
  }
  set stickyEnd(value: BooleanInput) {
    this._stickyEnd = coerceBooleanProperty(value);
  }
  private _stickyEnd = false;

  /** Whether this column should display in the roll-up footer. */
  @Input()
  get aggregate() {
    return this._aggregate;
  }
  set aggregate(value: BooleanInput) {
    this._aggregate = coerceBooleanProperty(value);
    if (this._aggregate) {
      this._table.aggregateColumns.add(this.name);
    } else {
      this._table.aggregateColumns.delete(this.name);
    }
  }
  private _aggregate = false;

  @ContentChild(IbCellDef, { static: true }) ibCellDef: IbCellDef;

  /** @ignore */
  @ViewChild(MatColumnDef, { static: true }) columnDef: MatColumnDef;

  /**
   * The column cell, headerCell, and footerCell are provided to the column during `ngOnInit` with a static query.
   * Normally, this will be retrieved by the column using `ContentChild`, but that assumes the
   * column definition was provided in the same view as the table, which is not the case with this
   * component.
   * @ignore
   */
  @ViewChild(MatCellDef, { static: true }) cell: MatCellDef;
  @ViewChild(MatHeaderCellDef, { static: true }) headerCell: MatHeaderCellDef;
  @ViewChild(MatFooterCellDef, { static: true }) footerCell: MatFooterCellDef;

  @ViewChild(IbAggregateCell) aggregateCell: IbAggregateCell;

  /** @ignore */
  get matSort() {
    return this._table.sort;
  }

  constructor(
    // tslint:disable-next-line: lightweight-tokens
    @Inject(IB_TABLE) @Optional() public _table: any,
    @Optional()
    @Inject(IB_COLUMN_OPTIONS)
    private _options: IbColumnOptions<T>
  ) {
    this._options = _options || {};
  }

  ngOnInit() {
    this._syncColumnDefName();

    if (this.headerText === undefined) {
      this.headerText = this._createDefaultHeaderText();
    }

    if (!this.dataAccessor) {
      this.dataAccessor =
        this._options.defaultDataAccessor ||
        ((data: T, name: string) => (data as any)[name]);
    }

    if (this._table) {
      // Provide the cell and headerCell directly to the table with the static `ViewChild` query,
      // since the columnDef will not pick up its content by the time the table finishes checking
      // its content and initializing the rows.
      this.columnDef.cell = this.cell;
      this.columnDef.headerCell = this.headerCell;
      this.columnDef.footerCell = this.footerCell;
      this._table.matTable.addColumnDef(this.columnDef);
    }
  }

  ngAfterViewInit() {
    this.handleStateChanges();
  }

  ngOnDestroy() {
    if (this._table) {
      this._table.matTable.removeColumnDef(this.columnDef);
    }
  }

  /**
   * Creates a default header text. Use the options' header text transformation function if one
   * has been provided. Otherwise simply capitalize the column name.
   */
  _createDefaultHeaderText() {
    const name = this.name;

    if (!name) {
      throw Error(`Table column must have a name.`);
    }

    if (this._options && this._options.defaultHeaderTextTransform) {
      return this._options.defaultHeaderTextTransform(name);
    }

    return name[0].toUpperCase() + name.slice(1);
  }

  /** Synchronizes the column definition name with the text column name. */
  private _syncColumnDefName() {
    if (this.columnDef) {
      this.columnDef.name = this.name;
    }
  }

  private handleStateChanges() {
    const changes$ = [this._table.paginator?.page, this._table.sort?.sortChange];

    if (this._table.filter) {
      changes$.push(this._table.filter?.ibRawFilterUpdated);
    }

    merge(...changes$).subscribe(() => {
      this.aggregateCell?.aggregate();
    });
  }
}
