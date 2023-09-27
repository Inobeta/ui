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
  Portal,
  TemplatePortal,
} from "@angular/cdk/portal";
import {
  Component,
  ComponentRef,
  ContentChild,
  ContentChildren,
  EventEmitter,
  InjectionToken,
  Input,
  OnDestroy,
  Output,
  QueryList,
  ViewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { filter } from "rxjs/operators";
import { IbTableDataExportAction } from "../data-export/table-data-export.component";
import { IbFilter } from "../kai-filter";
import { ITableViewData, IView, IbTableViewGroup } from "../views";
import { IbKaiTableAction } from "./action";
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
import { IbTextColumn } from "./text-column";

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
  actionPortals: Portal<any>[] = [];

  @ContentChildren(IbTextColumn) columns: QueryList<IbTextColumn<any>>;
  @ContentChild(IbSelectionColumn) selectionColumn!: IbSelectionColumn;
  @ContentChild(IbKaiRowGroupDirective) rowGroup!: IbKaiRowGroupDirective;
  @ContentChild(IbFilter) filter!: IbFilter;
  @ContentChild(IbTableViewGroup) view!: IbTableViewGroup;
  @ContentChildren(IbKaiTableAction, { descendants: true })
  actions: QueryList<IbKaiTableAction>;
  @ContentChild(IbTableDataExportAction) exportAction: IbTableDataExportAction;

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
  displayedColumns: string[] = []
  
  @Output() ibRowClicked = new EventEmitter<IbTableRowEvent>();

  ngOnInit() {
    this._dataSource.paginator = this.paginator;
    this._dataSource.sort = this.sort;

    if (this._dataSource instanceof IbDataSource) {
      this._dataSource._state.subscribe((s) => (this.state = s));
    }
  }

  ngAfterViewInit() {
    if (this.actions.length) {
      this.actions.forEach((a) =>
        this.actionPortals.push(
          new TemplatePortal(a.templateRef, a.viewContainerRef)
        )
      );
    }

    if (this.view && this.filter) {
      this.view.defaultView.data = {
        filter: this.filter.initialRawValue,
        pageSize: this.tableDef.paginator.pageSize,
      };

      this.view.viewDataAccessor = () => ({
        filter: this.filter.rawFilter,
        pageSize: this.paginator.pageSize,
      });

      this.view._activeView
        .pipe(filter((view) => !!view))
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

      for (const action of [
        this.filter.hideFilterAction,
        ...this.view.actions.toArray(),
      ]) {
        this.actionPortals.push(
          new TemplatePortal(action.templateRef, action.viewContainerRef)
        );
      }
    }

    if (this.exportAction) {
      this.exportAction.showSelectedRowsOption = !!this.selectionColumn;
      this.exportAction.ibDataExport.subscribe((settings) => {
        this.exportAction.exportService._exportFromTable(
          this.tableName,
          this.columns.toArray(),
          this.dataSource as MatTableDataSource<any>,
          this.selectionColumn?.selection.selected,
          settings
        );
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
      this.view.viewGroupName = this.tableName;
    }
  }

  ngOnDestroy() {
    this._componentCache = null;
  }

  isState(state: IbKaiTableState) {
    return this.state === state;
  }
}
