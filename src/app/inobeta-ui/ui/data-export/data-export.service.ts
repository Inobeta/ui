import { Inject, Injectable, InjectionToken } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { IbColumn } from "../kai-table/columns/column";
import { IbTableDataSource } from "../kai-table/table-data-source";
import { IbDataExportProvider } from "./provider";
import {
  IbTableDataExportDialog,
  IbTableDataExportDialogData,
} from "./table-data-export-dialog.component";

export interface IDataExportSettings {
  format: "xlsx" | "pdf" | "csv";
  dataset: "all" | "selected" | "current";
}

export const OVERRIDE_EXPORT_FORMATS = new InjectionToken<IbDataExportProvider>(
  "overrideExportFormats"
);

@Injectable({ providedIn: "root" })
export class IbDataExportService {
  formats: any;

  constructor(
    private dialog: MatDialog,
    @Inject(OVERRIDE_EXPORT_FORMATS) private providers: IbDataExportProvider[]
  ) {
    this.formats = this.providers.map((p) => ({
      value: p.format,
      label: p.label,
    }));
  }

  openExportDialog(data: Partial<IbTableDataExportDialogData>) {
    return this.dialog
      .open(IbTableDataExportDialog, {
        width: "350px",
        data: {
          ...data,
          formats: this.formats,
        },
      })
      .afterClosed();
  }

  /**
   * Internal use for IbTable
   *
   * @ignore
   */
  _exportFromTable(
    tableName: string,
    dataSource: IbTableDataSource<unknown>,
    settings: IDataExportSettings
  ) {
    let data: unknown[];

    if (settings.dataset === "all") {
      data = [...dataSource.filteredData];
      const sort = dataSource.sort;
      if (sort) {
        data = dataSource.sortData(data, sort);
      }
    }

    if (settings.dataset === "selected") {
      data = dataSource.selectionColumn?.selection.selected ?? [];
      const sort = dataSource.sort;
      if (sort) {
        data = dataSource.sortData(data, sort);
      }
    }

    if (settings.dataset === "current") {
      let ordered = [...dataSource.filteredData];
      const sort = dataSource.sort;
      if (sort) {
        ordered = dataSource.sortData(ordered, sort);
      }
      const pageIndex = dataSource.paginator?.pageIndex ?? 0;
      const pageSize = dataSource.paginator?.pageSize ?? ordered.length;
      data = ordered.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    }

    const columns = dataSource.sortedColumns.filter(
      (c) => !c.name().startsWith("ib-")
    );

    const dataAccessor = this.getDataAccessorForFormat(settings.format);

    const output = data.map((row) =>
      columns.reduce(
        (acc, column) => ({
          ...acc,
          [column.headerText()]: dataAccessor(row, column),
        }),
        {}
      )
    );

    this.export(output, tableName, settings.format);
  }

  /**
   *
   * @param data Array of object to export
   * @param filename Name of the output file
   * @param format Output file format. By default, only `xlsx`, `pdf`, and `csv` are supported
   */
  export(data: any[], filename: string, format: string) {
    const provider = this.providers.find((p) => p.format === format);
    return provider.export(data, filename);
  }

  /** @ignore */
  private getDataAccessorForFormat =
    (format: string) => (row: unknown, column: IbColumn<unknown>) => {
      const accessor = column.dataAccessor();
      const colName = column.name();
      const data = accessor ? accessor(row, colName) : (row as Record<string, unknown>)[colName];
      const fn =
        column?.["transform"]?.[format] ?? column?.["transform"]?.["ibAny"];
      if (!fn) {
        return data;
      }
      return fn(data);
    };
}
