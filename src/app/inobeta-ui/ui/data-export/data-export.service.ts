import { Inject, Injectable, InjectionToken } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { IbColumn } from "../kai-table/columns/column";
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
    columns: IbColumn<any>[],
    dataSource: MatTableDataSource<any>,
    selectedRows: any[],
    settings: IDataExportSettings
  ) {
    let data: any[];
    if (settings.dataset === "all") {
      data = dataSource._orderData(dataSource.filteredData);
    }

    if (settings.dataset === "selected") {
      data = dataSource._orderData(selectedRows);
    }

    if (settings.dataset === "current") {
      data = dataSource._pageData(
        dataSource._orderData(dataSource.filteredData)
      );
    }

    const displayHeader = {};
    for (const column of columns) {
      displayHeader[column.name] = column.headerText;
    }

    const transformByFormatFn = `${settings.format}transform`;
    const dataAccessor = (row, column) =>
      transformByFormatFn in column
        ? column[transformByFormatFn](column.dataAccessor(row, column.name))
        : "transform" in column
        ? column.transform(column.dataAccessor(row, column.name))
        : column.dataAccessor(row, column.name);

    const outputData = [];
    for (const row of data) {
      let outputRow = {};
      for (const column of columns) {
        const header = displayHeader[column.name];
        const displayValue = dataAccessor(row, column);
        outputRow[header] = displayValue;
      }
      outputData.push(outputRow);
    }

    this.export(outputData, tableName, settings.format);
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
}
