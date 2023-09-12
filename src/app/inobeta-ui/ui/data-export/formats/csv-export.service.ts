declare global {
  interface Navigator {
    msSaveBlob: (blob: Blob, filename: string) => void;
  }
}

import { Injectable } from "@angular/core";
import Papa from "papaparse";
import { OVERRIDE_EXPORT_FORMATS } from "../data-export.service";
import { IbDataExportProvider } from "../provider";

@Injectable()
export class IbCSVExportService implements IbDataExportProvider {
  format = 'csv';
  label = 'Comma Separated Value (.csv)';

  export(data: any[], filename: string): void {
    const csv = Papa.unparse(data, {
      quotes: true,
      delimiter: ";",
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    if (navigator.msSaveBlob) {
      // IE 10+
      navigator.msSaveBlob(blob, filename + ".csv");
    } else {
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename + ".csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }
}

export const IbCSVExportProvider = {
  provide: OVERRIDE_EXPORT_FORMATS,
  useClass: IbCSVExportService,
  multi: true
}