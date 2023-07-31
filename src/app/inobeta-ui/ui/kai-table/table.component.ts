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
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { skip } from "rxjs/operators";
import { IbFilter } from "../kai-filter";
import { IbTableViewGroup, ITableViewData, IView } from "../views";
import { IbCell } from "./cells";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbSelectionColumn } from "./selection-column";
import { IbDataSource } from "./table-data-source";
import {
  IbCellData,
  IbColumnDef,
  IbKaiTableState,
  IbTableDef,
  IbTableRowEvent,
} from "./table.types";

export const IB_TABLE = new InjectionToken<any>("IbTable");
export const IB_CELL_DATA = new InjectionToken<IbCellData>("IbCellData");

const defaultTableDef: IbTableDef = {
  paginator: {
    pageSizeOptions: [5, 10, 25, 100],
    showFirstLastButtons: true,
    pageSize: 10,
  },
};

@Component({
  selector: "ib-kai-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
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
  private _dataSource: MatTableDataSource<any> | IbDataSource<any> =
    new MatTableDataSource([]);
  // tslint:disable-next-line: variable-name
  private _tableDef: IbTableDef = defaultTableDef;
  // tslint:disable-next-line: variable-name
  private _columns: IbColumnDef<any>[] = [];
  // tslint:disable-next-line: variable-name
  private _componentCache: any = {};

  @ContentChild(IbSelectionColumn) selectionColumn!: IbSelectionColumn;
  @ContentChild(IbKaiRowGroupDirective) rowGroup!: IbKaiRowGroupDirective;
  @ContentChild(IbFilter) filter!: IbFilter;
  @ContentChild(IbTableViewGroup) view!: IbTableViewGroup;

  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  expandedElement: any;

  states = IbKaiTableState;
  state = IbKaiTableState.IDLE;

  @Input()
  set dataSource(value: MatTableDataSource<any> | IbDataSource<any>) {
    this._dataSource = value;
  }
  get dataSource() {
    return this._dataSource;
  }

  /** @ignore */
  @Input()
  set data(value: any[]) {
    this._dataSource.data = value;
  }

  @Input() tableName = btoa(window.location.pathname + window.location.hash);
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
    let displayedColumns = [];
    if (this.isSelectionColumnAdded) {
      displayedColumns = displayedColumns.concat(["ibSelectColumn"]);
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

    if (this._dataSource instanceof IbDataSource) {
      this._dataSource._state.subscribe((s) => (this.state = s));
    }
  }

  ngAfterViewInit() {
    if (this.table && this.selectionColumn) {
      setTimeout(() => (this.isSelectionColumnAdded = true));
    }

    if (this.view) {
      this.view.defaultView.data = {
        filter: this.filter.initialRawValue,
        pageSize: this.tableDef.paginator.pageSize,
      };

      this.view.viewDataAccessor = () => ({
        filter: this.filter.rawFilter,
        pageSize: this.paginator.pageSize,
      });

      this.view._activeView
        .pipe(skip(1))
        .subscribe((view: IView<ITableViewData>) => {
          this.paginator.firstPage();
          this.paginator.pageSize = view.data.pageSize;
          this.filter.value = view.data.filter;
        });

      this.filter.ibRawFilterUpdated.subscribe((rawFilter) => {
        this.view.dirty =
          JSON.stringify(rawFilter) !==
          JSON.stringify(this.view.activeView.data.filter);
      });
      this.paginator.page.subscribe((p) => {
        this.view.dirty = p.pageSize !== this.view.activeView.data.pageSize;
      });
    }
  }

  ngAfterContentInit() {
    if (this.filter) {
      const updateFilter = (filter) => {
        this.selectionColumn?.selection?.clear();
        this.dataSource.filter = filter as any;
      };
      this.dataSource.filterPredicate = this.filter.filterPredicate;
      if (this._dataSource instanceof IbDataSource) {
        this.filter.ibRawFilterUpdated.subscribe(updateFilter);
        return;
      }

      this.filter.filters.forEach((f) =>
        f.initializeFromColumn(this.dataSource.data)
      );
      this.filter.ibFilterUpdated.subscribe(updateFilter);
    }

    if (this.view) {
      this.view.viewGroupName = this.tableName as string;
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

  isState(state: IbKaiTableState) {
    return this.state === state;
  }
}
