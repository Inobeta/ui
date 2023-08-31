import { Injectable } from "@angular/core";
import * as XLSX from "xlsx";
import { OVERRIDE_EXPORT_FORMATS } from "../data-export.service";
import { IbDataExportProvider } from "../provider";

@Injectable({ providedIn: 'root' })
export class IbXLSXExportService implements IbDataExportProvider {
  format = 'xlsx';
  label = 'Microsoft Excel (.xlsx)';

  export(data: any[], filename: string): void {
    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: false });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename);
    XLSX.writeFile(wb, filename + ".xlsx");
  }

}

export const IbXLXSExportProvider = {
  provide: OVERRIDE_EXPORT_FORMATS,
  useClass: IbXLSXExportService,
  multi: true
}