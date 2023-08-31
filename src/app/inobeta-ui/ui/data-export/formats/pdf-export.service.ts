import { ClassProvider, Inject, Injectable, Optional } from "@angular/core";
import jsPDF, { jsPDFOptions } from "jspdf";
import autoTable, { UserOptions } from "jspdf-autotable";
import {
  IB_DATA_JSPDF_AUTOTABLE_USER_OPTIONS,
  IB_DATA_JSPDF_OPTIONS,
  OVERRIDE_EXPORT_FORMATS,
} from "../data-export.service";
import { IbDataExportProvider } from "../provider";

@Injectable()
export class IbPDFExportService implements IbDataExportProvider {
  format = "pdf";
  label = "PDF (.pdf)";

  private defaultPdfSetup: jsPDFOptions = {
    orientation: "l",
    unit: null,
    format: null,
    compress: true,
  };

  constructor(
    @Optional()
    @Inject(IB_DATA_JSPDF_OPTIONS)
    public pdfSetup: jsPDFOptions,
    @Optional()
    @Inject(IB_DATA_JSPDF_AUTOTABLE_USER_OPTIONS)
    public pdfUserOptions: UserOptions = {}
  ) {
    if (!pdfSetup) {
      this.pdfSetup = this.defaultPdfSetup;
    }
  }

  export(data: any[], filename: string): void {
    const doc = new jsPDF(this.pdfSetup);
    autoTable(doc, {
      ...this.pdfUserOptions,
      body: data,
      columns: this.preparePdfColumns(Object.keys(data[0])),
    });
    doc.save(filename + ".pdf");
  }

  private preparePdfColumns(columns: string[]) {
    return columns
      .map((c) => ({
        header: c,
        dataKey: c,
      }));
  }
}

export const IbPDFExportProvider: ClassProvider = {
  provide: OVERRIDE_EXPORT_FORMATS,
  useClass: IbPDFExportService,
  multi: true,
};
