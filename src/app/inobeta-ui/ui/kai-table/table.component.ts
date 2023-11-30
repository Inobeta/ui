import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Portal, TemplatePortal } from "@angular/cdk/portal";
import {
  Component,
  ContentChild,
  ContentChildren,
  EventEmitter,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { Subject, merge } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { IbTableDataExportAction } from "../data-export/table-data-export.component";
import { IbFilter } from "../kai-filter";
import { ITableViewData, IView, IbTableViewGroup } from "../views";
import { IbColumn } from "./columns/column";
import { IbSelectionColumn } from "./columns/selection-column";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbDataSource } from "./table-data-source";
import { IbKaiTableState, IbTableDef } from "./table.types";
import { IB_TABLE } from "./tokens";

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
  providers: [{ provide: IB_TABLE, useExisting: IbTable }],
})
export class IbTable implements OnDestroy {
  private _destroyed = new Subject();

  @ContentChildren(IbColumn) columns: QueryList<IbColumn<any>>;
  @ContentChild(IbSelectionColumn) selectionColumn!: IbSelectionColumn;
  @ContentChild(IbKaiRowGroupDirective) rowGroup!: IbKaiRowGroupDirective;

  @ContentChild(IbFilter) filter!: IbFilter;
  @ContentChild(IbTableViewGroup) view!: IbTableViewGroup;

  @ContentChild(IbTableDataExportAction) exportAction: IbTableDataExportAction;

  @ViewChild(MatTable, { static: true }) matTable: MatTable<any>;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  expandedElement: any;
  actionPortals: Portal<any>[] = [];

  states = IbKaiTableState;
  state = IbKaiTableState.IDLE;

  @Input()
  set data(data: any[]) {
    this.dataSource.data = data;
    this.initializeFilters(data);
  }

  @Input()
  dataSource: MatTableDataSource<unknown> | IbDataSource<unknown> =
    new MatTableDataSource([]);

  @Input() tableName: string = btoa(
    window.location.pathname + window.location.hash
  );

  /**
   * Configuration for the table and its inner components. Currently supports only
   * `paginator` and `sort` parameters.
   *
   * If left empty, the following default is used
   *
   * ```
   * {
   *   paginator : {
   *     pageSizeOptions: [5, 10, 25, 100],
   *     showFirstLastButtons: true,
   *     pageSize: 10,
   *     hide: false,
   *   }
   * }
   * ```
   */
  @Input()
  set tableDef(value: Partial<IbTableDef>) {
    this._tableDef = {
      ...defaultTableDef,
      ...value,
    };
  }
  get tableDef() {
    return this._tableDef;
  }
  private _tableDef: IbTableDef = defaultTableDef;

  /**
   * Columns to be displayed.
   *
   * The order of the columns present in this array is rendered
   * as is in a language written from left-to-right. It is reversed
   * in a language written from right-to-left.
   */
  @Input()
  set displayedColumns(columns: string[]) {
    this._displayedColumns = columns;
    if (this.selectionColumn) {
      this._displayedColumns.unshift("ib-selection");
    }
    if (this.columns?.find((c) => c.name === "ib-action")) {
      this._displayedColumns.push("ib-action");
    }
  }
  get displayedColumns() {
    return this._displayedColumns;
  }
  private _displayedColumns: string[] = [];

  aggregateColumns = new Set<string>();
  aggregate = new EventEmitter();

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.dataSource instanceof IbDataSource) {
      this.dataSource._state
        .pipe(takeUntil(this._destroyed))
        .subscribe((s) => (this.state = s));
    }
  }

  ngAfterViewInit() {
    if (this.view && this.filter) {
      this.setupViewGroup();
    }

    if (this.exportAction) {
      this.setupExportAction();
    }
  }

  ngAfterContentInit() {
    if (this.filter) {
      this.setupFilter();
    }

    if (this.view) {
      this.view.viewGroupName = this.tableName;
    }
  }

  ngOnDestroy() {
    this.aggregateColumns.clear();
    this._destroyed.next();
    this._destroyed.complete();
  }

  isState(state: IbKaiTableState) {
    return this.state === state;
  }

  private setupFilter() {
    const updateFilter = (filter) => {
      this.selectionColumn?.selection?.clear();
      this.dataSource.filter = filter as any;
    };
    this.dataSource.filterPredicate = this.filter.filterPredicate;
    this.initializeFilters(this.dataSource.data);

    this.filter.ibFilterUpdated
      .pipe(takeUntil(this._destroyed))
      .subscribe(updateFilter);
  }

  private setupViewGroup() {
    this.view.defaultView.data = {
      filter: this.filter.initialRawValue,
      pageSize: this.tableDef.paginator.pageSize,
      aggregate: this.getAggregateCells(),
    };

    this.view.viewDataAccessor = () => ({
      filter: this.filter.rawFilter,
      pageSize: this.paginator.pageSize,
      aggregate: this.getAggregateCells(),
    });

    const changes$ = merge(
      this.filter.ibRawFilterUpdated,
      this.paginator.page,
      this.aggregate
    ).pipe(takeUntil(this._destroyed));
    this.view.handleStateChanges(changes$);

    this.view._activeView
      .pipe(
        filter((view) => !!view),
        takeUntil(this._destroyed)
      )
      .subscribe(this.handleChangeView);

    for (const action of [
      this.filter.hideFilterAction,
      ...this.view.actions.toArray(),
    ]) {
      this.actionPortals.push(
        new TemplatePortal(action.templateRef, action.viewContainerRef)
      );
    }
  }

  private setupExportAction() {
    this.exportAction.showSelectedRowsOption = !!this.selectionColumn;
    this.exportAction.ibDataExport
      .pipe(takeUntil(this._destroyed))
      .subscribe((settings) => {
        this.exportAction.exportService._exportFromTable(
          this.tableName,
          this.columns.filter((c) => !c.name.startsWith("ib-")),
          this.dataSource as MatTableDataSource<any>,
          this.selectionColumn?.selection.selected,
          settings
        );
      });
  }

  private initializeFilters(data: any[]) {
    this.filter?.filters.forEach((f) => f.initializeFromColumn(data));
  }

  private handleChangeView = (view: IView<ITableViewData>) => {
    this.paginator.firstPage();
    this.paginator.pageSize = view.data.pageSize;
    this.filter.value = view.data.filter;
    view.data.aggregate.forEach((a) => {
      const column = this.columns.find((c) => a.name === c.name);
      column?.aggregateCell?.apply(a.function);
    });
  };

  private getAggregateCells = () =>
    this.columns
      .filter((c) => !!c.aggregateCell)
      .map((c) => ({
        name: c.name,
        function: c.aggregateCell.function,
      }));
}
