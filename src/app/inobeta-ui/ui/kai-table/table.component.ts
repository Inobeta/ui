import { CdkPortalOutletAttachedRef, ComponentPortal } from '@angular/cdk/portal';
import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  InjectionToken,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IbCell } from './cells';
import { IbCellData, IbColumnDef, IbTableDef, IbTableRowEvent } from './table.types';

export const IB_CELL_DATA = new InjectionToken<IbCellData>('IbCellData');

const defaultTableDef: IbTableDef = {
  paginator: {
    pageSizeOptions: [5, 10, 25, 100],
    showFirstLastButtons: true,
    pageSize: 10,
  }
};

function* generateTableName() {
  let i = 0;
  while (true) {
    yield btoa(window.location.pathname + window.location.hash + i++);
  }
}
const tableNameGen = generateTableName();

@Component({
  selector: 'ib-kai-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IbTable {
  private _dataSource!: MatTableDataSource<any>;
  private _tableDef: IbTableDef = defaultTableDef;
  private _columns!: IbColumnDef<any>[];
  private _componentCache: any = {};

  @ViewChild(MatSort)
  set sort(value) {
    if (this._dataSource) {
      this._dataSource.sort = value;
    }
  }
  @ViewChild(MatPaginator)
  set paginator(value) {
    if (this._dataSource) {
      this._dataSource.paginator = value;
    }
  }

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
      ...value
    };
  }
  get tableDef() {
    return this._tableDef;
  }

  displayedColumns;
  @Input()
  set columns(value) {
    this._columns = value;
    this.displayedColumns = this.columns.map(c => c.columnDef);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this._columns.length; i++) {
      this.getCell(this._columns[i]);
    }
  }
  get columns() {
    return this._columns;
  }

  get portals() {
    return this._componentCache;
  }

  @Output() ibRowClicked = new EventEmitter<IbTableRowEvent>();

  ngOnDestroy() {
    this._componentCache = null;
  }

  private sendRowEvent = (event: Partial<IbTableRowEvent>) =>
    this.ibRowClicked.emit({
      ...event as IbTableRowEvent,
      tableName: this.tableName || '',
    })

  getCell(column: IbColumnDef) {
    if (column.columnDef in this._componentCache) {
      return this._componentCache[column.columnDef];
    }
    this._componentCache[column.columnDef] = new ComponentPortal(column.component ?? IbCell);
  }

  handleAttached(ref: CdkPortalOutletAttachedRef, column: IbColumnDef, row: any) {
    (ref as ComponentRef<IbCell>).instance.data = {
      send: this.sendRowEvent,
      column,
      row
    };
  }
}

