declare global {
  interface Navigator {
    msSaveBlob: (blob: Blob, filename: string) => void;
  }
}

import { Inject, Injectable, InjectionToken, Optional } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { TranslateService } from "@ngx-translate/core";
import jsPDF, { jsPDFOptions } from "jspdf";
import autoTable, { ColumnInput, UserOptions } from "jspdf-autotable";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { IbColumnDef } from "../kai-table/table.types";
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

@Injectable({ providedIn: "root" })
export class IbDataExportService {
  private defaultPdfSetup: jsPDFOptions = {
    orientation: "l",
    unit: null,
    format: null,
    compress: true,
  };
  filename = "__internal";

  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
    @Optional()
    @Inject(IB_DATA_JSPDF_OPTIONS)
    public pdfSetup: jsPDFOptions,
    @Optional()
    @Inject(IB_DATA_JSPDF_AUTOTABLE_USER_OPTIONS)
    public pdfUserOptions: UserOptions = {}
  ) {
    if (!this.pdfSetup) {
      this.pdfSetup = this.defaultPdfSetup;
    }
  }

  openDialog(data: IbTableDataExportDialogData) {
    return this.dialog
      .open(IbTableDataExportDialog, {
        width: "350px",
        data,
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
    this.filename = tableName;

    let data: any[];
    if (settings.dataset === "all") {
      data = dataSource._orderData(dataSource.filteredData);
    }

    if (settings.dataset === "selected") {
      data = dataSource._orderData(selectedRows);
    }

    if (settings.dataset === "current") {
      const pageSize = dataSource.paginator.pageSize;
      const skip = pageSize * dataSource.paginator.pageIndex;
      data = dataSource
        ._orderData(dataSource.filteredData)
        .filter((d, i) => i >= skip)
        .filter((d, i) => i < pageSize);
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

    if (settings.format === "pdf") {
      const header = this.preparePdfColumns(columns);
      return this.pdfExport(outputData, header);
    }

    if (settings.format === "xlsx") {
      return this.xlsxExport(outputData);
    }

    if (settings.format === "csv") {
      return this.csvExport(outputData);
    }
  }

  private preparePdfColumns(columns: IbColumnDef[]) {
    return columns
      .filter((c) => c.header)
      .map((c) => ({
        header: this.translate.instant(c.header),
        dataKey: this.translate.instant(c.header),
      }));
  }

  pdfExport(body, columns: ColumnInput[]) {
    const doc = new jsPDF(this.pdfSetup);
    autoTable(doc, {
      ...this.pdfUserOptions,
      body,
      columns,
    });
    doc.save(this.filename + ".pdf");
  }

  xlsxExport(data: any[], skipHeader = false) {
    const ws = XLSX.utils.json_to_sheet(data, { skipHeader });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.filename);
    XLSX.writeFile(wb, this.filename + ".xlsx");
  }

  csvExport(data: any[]) {
    const csv = Papa.unparse(data, {
      quotes: true,
      delimiter: ";",
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, this.filename + ".csv");
    } else {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", this.filename + ".csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
}
