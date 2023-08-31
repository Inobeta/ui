import { Inject, Injectable, InjectionToken } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import { jsPDFOptions } from "jspdf";
import { IbColumnDef } from "../kai-table/table.types";
import { IbDataExportProvider } from "./provider";
import {
  IbTableDataExportDialog,
  IbTableDataExportDialogData,
} from "./table-data-export-dialog.component";

export interface IDataExportSettings {
  format: "xlsx" | "pdf" | "csv";
  dataset: "all" | "selected" | "current";
}

export const IB_DATA_JSPDF_OPTIONS = new InjectionToken<jsPDFOptions>(
  "jsPDFOptions"
);

export const IB_DATA_JSPDF_AUTOTABLE_USER_OPTIONS =
  new InjectionToken<jsPDFOptions>("jsPDFAutotableUserOptions");

export const OVERRIDE_EXPORT_FORMATS = new InjectionToken<IbDataExportProvider>("overrideExportFormats")

@Injectable({ providedIn: "root" })
export class IbDataExportService {
  filename = "__internal";
  formats: any;

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    @Inject(OVERRIDE_EXPORT_FORMATS) private providers: IbDataExportProvider[]
  ) {
    this.formats = this.providers.map(p => ({
      value: p.format,
      label: p.label
    }));
  }

  openDialog(data: Partial<IbTableDataExportDialogData>) {
    return this.dialog
      .open(IbTableDataExportDialog, {
        width: "350px",
        data: {
          ...data,
          formats: this.formats
        },
      })
      .afterClosed();
  }

  exportFromTable(
    tableName: string,
    columns: IbColumnDef[],
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

    const outputData = [];
    for (const row of data) {
      let outputRow = {};
      for (const column of columns.filter((c) => c.header)) {
        const displayHeader = this.translate.instant(column.header);
        const displayValue = column.cell(row);
        outputRow[displayHeader] = displayValue;
      }
      outputData.push(outputRow);
    }

    const provider = this.providers.find(p => p.format === settings.format);
    provider.export(outputData, tableName);
  }
}
