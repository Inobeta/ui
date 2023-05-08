import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import {
  CdkPortalOutletAttachedRef,
  ComponentPortal,
} from "@angular/cdk/portal";
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  ContentChild,
  EventEmitter,
  InjectionToken,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, Sort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { IbCell } from "./cells";
import { IbKaiRowGroupDirective } from "./rowgroup";
import {
  IbCellData,
  IbColumnDef,
  IbTableDef,
  IbTableRowEvent,
} from "./table.types";
import { IbSelectionColumn } from "./selection-column";

export const IB_CELL_DATA = new InjectionToken<IbCellData>("IbCellData");

const defaultTableDef: IbTableDef = {
  paginator: {
    pageSizeOptions: [5, 10, 25, 100],
    showFirstLastButtons: true,
    pageSize: 10,
  },
};

function* generateTableName() {
  let i = 0;
  while (true) {
    yield btoa(window.location.pathname + window.location.hash + i++);
  }
}
const tableNameGen = generateTableName();

@Component({
  selector: "ib-kai-table",
  templateUrl: "./table.component.html",
  styles: [
    `
      .ib-table-scrollable {
        overflow-y: auto;
      }

      tr.ib-table-group-detail-row {
        height: 0;
      }

      tr.ib-table-element-row:not(.ib-table-expanded-row):hover {
        background: whitesmoke;
      }

      ::ng-deep .ib-table-expanded-row > td {
        border-bottom-width: 0;
      }

      .ib-table-element-detail {
        overflow: hidden;
        display: flex;
      }
    `,
  ],
  animations: [
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0" })),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class IbTable implements OnDestroy {
  // tslint:disable-next-line: variable-name
  private _dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
  // tslint:disable-next-line: variable-name
  private _tableDef: IbTableDef = defaultTableDef;
  // tslint:disable-next-line: variable-name
  private _columns!: IbColumnDef<any>[];
  // tslint:disable-next-line: variable-name
  private _componentCache: any = {};
  @ContentChild(IbSelectionColumn) selectionColumn!: IbSelectionColumn;
  @ContentChild(IbKaiRowGroupDirective) rowGroup!: IbKaiRowGroupDirective;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;

  expandedElement: any;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @Input()
  set dataSource(value: MatTableDataSource<any>) {
    this._dataSource = value;
  }
  get dataSource() {
    return this._dataSource;
  }

  @Input() tableName = tableNameGen.next().value;
  @Input()
  set tableDef(value) {
    this._tableDef = {
      ...defaultTableDef,
      ...value,
    };
  }
  get tableDef() {
    return this._tableDef;
  }

  @Input()
  set columns(value) {
    this._columns = value;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this._columns.length; i++) {
      this.getCell(this._columns[i]);
    }
  }
  get columns() {
    return this._columns;
  }

  isSelectionColumnAdded = false;
  get displayedColumns() {
    const displayedColumns = [];
    if (this.isSelectionColumnAdded) {
      displayedColumns.push("ibSelectColumn");
    }
    return displayedColumns.concat(this.columns.map((c) => c.columnDef));
  }

  get portals() {
    return this._componentCache;
  }

  @Output() ibRowClicked = new EventEmitter<IbTableRowEvent>();

  ngOnInit() {
    this._dataSource.paginator = this.paginator;
    this._dataSource.sort = this.sort;
  }

  ngAfterViewInit() {
    if (this.table && this.selectionColumn) {
      this.isSelectionColumnAdded = true;
    }
  }

  ngAfterContentInit() {
    if (this.table && this.selectionColumn) {
      this.table.addColumnDef(this.selectionColumn.columnDef);
    }
  }

  ngOnDestroy() {
    this._componentCache = null;
  }

  private sendRowEvent = (event: Partial<IbTableRowEvent>) =>
    this.ibRowClicked.emit({
      ...(event as IbTableRowEvent),
      tableName: this.tableName || "",
    });

  getCell(column: IbColumnDef) {
    if (column.columnDef in this._componentCache) {
      return this._componentCache[column.columnDef];
    }
    this._componentCache[column.columnDef] = new ComponentPortal(
      column.component ?? IbCell
    );
  }

  handleAttached(
    ref: CdkPortalOutletAttachedRef,
    column: IbColumnDef,
    row: any
  ) {
    (ref as ComponentRef<IbCell>).instance.data = {
      send: this.sendRowEvent,
      column,
      row,
    };
  }
}
