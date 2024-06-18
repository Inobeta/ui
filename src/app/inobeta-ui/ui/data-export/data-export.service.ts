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
      data = dataSource._orderData(dataSource.filteredData);
    }

    if (settings.dataset === "selected") {
      data = dataSource._orderData(
        dataSource.selectionColumn?.selection.selected
      );
    }

    if (settings.dataset === "current") {
      data = dataSource._pageData(
        dataSource._orderData(dataSource.filteredData)
      );
    }

    const columns = Object.values(dataSource.columns).filter(
      (c) => !c.name.startsWith("ib-")
    );
    const displayHeader = columns.reduce(
      (acc, column) => ({ ...acc, [column.name]: column.headerText }),
      {}
    );

    const dataAccessor = this.getDataAccessorForFormat(settings.format);

    const output = data.map((row) =>
      columns.reduce(
        (acc, column) => ({
          ...acc,
          [displayHeader[column.name]]: dataAccessor(row, column),
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
      const data = column.dataAccessor(row, column.name);
      const fn =
        column?.["transform"]?.[format] ?? column?.["transform"]?.["ibAny"];
      if (!fn) {
        return data;
      }
      return fn(data);
    };
}
