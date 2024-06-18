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
  HostBinding,
  Input,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewEncapsulation,
  booleanAttribute,
  inject,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { Subject} from "rxjs";
import { takeUntil } from "rxjs/operators";
import { IbTableDataExportAction } from "../data-export/table-data-export.component";
import { IbFilter } from "../kai-filter";
import { IbTableViewGroup } from "../views";
import { IbColumn } from "./columns/column";
import { IbSelectionColumn } from "./columns/selection-column";
import { IbTableRemoteDataSource } from "./remote-data-source";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbTableDataSource } from "./table-data-source";
import { IbKaiTableState, IbTableDef } from "./table.types";
import { IB_TABLE } from "./tokens";
import { IbTableUrlService } from "./table-url.service";
import { Store } from "@ngrx/store";
import { urlStateActions } from "./store/url-state/actions";

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
  host: {
    class: "ib-table__container",
  },
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
  encapsulation: ViewEncapsulation.None,
})
export class IbTable implements OnDestroy {
  private _destroyed = new Subject<void>();

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

  @Input() state: IbKaiTableState = "idle";

  @Input()
  set data(data: any[]) {
    this.dataSource.data = data;
  }

  @Input()
  dataSource: IbTableDataSource<unknown> = new IbTableDataSource([]);

  @Input() tableName: string = btoa(
    window.location.pathname + window.location.hash
  );

  tableUrl = inject(IbTableUrlService);
  private store = inject(Store);

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
   *
   * NB: querystring override these values
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
  private _tableDef: IbTableDef = {...defaultTableDef};


  /**
   * Columns to be displayed.
   *
   * The order of the columns present in this array is rendered
   * as is in a language written from left-to-right. It is reversed
   * in a language written from right-to-left.
   */
  @Input()
  set displayedColumns(columns: string[]) {
    this._displayedColumns = columns.map((c) => c);
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

  @HostBinding("class.ib-table-striped-rows")
  @Input({ transform: booleanAttribute })
  stripedRows = false;

  isRemote = false;


  ngOnInit() {
    const paginatorFromUrl = this.tableUrl.getPaginator(this.tableName);
    this.tableDef.paginator = {
      ...this.tableDef.paginator,
      ...paginatorFromUrl,
    }
    this.dataSource.tableName = this.tableName;
    this.dataSource.paginator = this.paginator;


    if (this.dataSource instanceof IbTableRemoteDataSource) {
      this.isRemote = true;
      this.dataSource._state
        .pipe(takeUntil(this._destroyed))
        .subscribe((s) => (this.state = s));
    }
  }

  ngAfterViewInit() {
    if (this.exportAction) {
      this.setupExportAction();
    }
  }

  ngAfterContentInit() {

    const viewInit = () => {
      this.view.viewGroupName = this.tableName;
      this.dataSource.view = this.view;
      this.setupViewGroup();
    }

    const dsInit = () => {
      this.dataSource.sort = this.sort;
      this.dataSource.aggregatedColumns = this.tableUrl.getAggregatedColumns(this.tableName);
      this.dataSource.sortState = {
        ...this.tableDef.initialSort,
        ...this.tableUrl.getSort(this.tableName),
      };
    }


    this.dataSource.selectionColumn = this.selectionColumn;
    this.dataSource.filter = this.filter;
    this.filter?.initialized.subscribe(() => {
      this.tableUrl.emptyFilterSchema[this.tableName] = structuredClone(this.filter.initialRawValue);
      //NG0100
      setTimeout(() => dsInit())

      const filtersFromUrl = this.tableUrl.getFilters(this.tableName)
      this.filter.value = filtersFromUrl
      if (this.view) {
        //NG0100
        setTimeout(() => viewInit())
      }
    })

    // If there is no filter, we need to set the viewGroupName to the table name
    if (this.view && !this.filter) {
      setTimeout(() => viewInit())
    }

    if(!this.filter){
      setTimeout(() => dsInit())
    }
    this.dataSource.columns = this.columns.toArray();
    this.columns.changes
      .pipe(takeUntil(this._destroyed))
      .subscribe((columns) => {
        this.dataSource.columns = columns.toArray();
      });
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  setPaginatorState(params){
    this.store.dispatch(urlStateActions.setPaginator({tableName: this.tableName, params}))
  }
  private setupViewGroup() {
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
    this.exportAction.showAllRowsOption = !this.isRemote;
    this.exportAction.ibDataExport
      .pipe(takeUntil(this._destroyed))
      .subscribe((settings) => {
        this.exportAction.exportService._exportFromTable(
          this.tableName,
          this.dataSource,
          settings
        );
      });
  }
}
