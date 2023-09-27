import { Inject, Injectable, InjectionToken } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import { jsPDFOptions } from "jspdf";
import { UserOptions } from "jspdf-autotable";
import { IbColumnDef } from "../kai-table/table.types";
import { IbDataExportProvider } from "./provider";
import {
  IbTableDataExportDialog,
  IbTableDataExportDialogData,
} from "./table-data-export-dialog.component";
import { IbTextColumn } from "../kai-table/text-column";

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
    private translate: TranslateService,
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
    columns: IbTextColumn<any>[],
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
    for (const column of columns.filter((c) => c.name)) {
      displayHeader[column.name] = this.translate.instant(column.headerText);
    }

    const outputData = [];
    for (const row of data) {
      let outputRow = {};
      for (const column of columns.filter((c) => c.name)) {
        const header = displayHeader[column.name];
        const displayValue = column.dataAccessor(row, column.name);
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
