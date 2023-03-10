import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import {
  CdkPortalOutletAttachedRef,
  ComponentPortal,
} from '@angular/cdk/portal';
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
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { IbCell } from './cells';
import { IbKaiRowGroupDirective } from './rowgroup';
import {
  IbCellData,
  IbColumnDef,
  IbTableDef,
  IbTableRowEvent,
  IbTableRowSelectionChange,
} from './table.types';

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
  styles:[`
  .ib-table-scrollable{
    overflow-y: auto;
  }

  tr.ib-table-group-detail-row {
    height: 0;
  }

  tr.ib-table-element-row:not(.ib-table-expanded-row):hover {
    background: whitesmoke;
  }

  tr.ib-table-element-row:not(.ib-table-expanded-row):active {
    background: #efefef;
  }

  .ib-table-element-row td {
    border-bottom-width: 0;
  }

  .ib-table-element-detail {
    overflow: hidden;
    display: flex;
  }


  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class IbTable implements OnDestroy {
  // tslint:disable-next-line: variable-name
  private _dataSource!: MatTableDataSource<any>;
  // tslint:disable-next-line: variable-name
  private _tableDef: IbTableDef = defaultTableDef;
  // tslint:disable-next-line: variable-name
  private _columns!: IbColumnDef<any>[];
  // tslint:disable-next-line: variable-name
  private _componentCache: any = {};
  @ContentChild(IbKaiRowGroupDirective) rowGroup!: IbKaiRowGroupDirective;
  expandedElement: any;

  @ViewChild(MatSort)
  set sort(value) {
    if (this._dataSource) {
      this._dataSource.sort = value;
    }
  }
  @ViewChild(MatPaginator)
  set paginator(value) {
    console.log('set paginator', value)
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

  get displayedColumns(){
    const displayedColumns = []
    if(this.selectableRows){
      displayedColumns.push('ibSelectColumn')
    }
    return displayedColumns.concat(this.columns.map((c) => c.columnDef))
  }

  get portals() {
    return this._componentCache;
  }

  @Input() selectableRows = false;

  @Output() ibRowClicked = new EventEmitter<IbTableRowEvent>();
  @Output() ibRowSelectionChange = new EventEmitter<IbTableRowSelectionChange[]>();

  selection = new SelectionModel<any>(true, []);
  ngOnDestroy() {
    this._componentCache = null;
  }

  private sendRowEvent = (event: Partial<IbTableRowEvent>) =>
    this.ibRowClicked.emit({
      ...(event as IbTableRowEvent),
      tableName: this.tableName || '',
    })

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

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected == numRows;
  }

  toggleAllRows() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));

    const selectionAfterToggle = this.isAllSelected()
    this.ibRowSelectionChange.emit(
      this.dataSource.data.map(row => ({
        tableName: this.tableName || '',
        row,
        selection: selectionAfterToggle
      }))
    )
  }

  toggleRowSelection(ev, row){
    if(ev){
      this.selection.toggle(row)

      this.ibRowSelectionChange.emit([{
        tableName: this.tableName || '',
        row,
        selection: ev.checked
      }])
    }
  }
}
