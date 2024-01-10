import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslateModule } from "@ngx-translate/core";
import { IbTableActionModule } from "../kai-table";
import { IbDataExportService } from "./data-export.service";
import { IbCSVExportProvider } from "./formats/csv-export.service";
import { IbPDFExportProvider } from "./formats/pdf-export.service";
import { IbXLXSExportProvider } from "./formats/xlsx-export.service";
import { IbTableDataExportDialog } from "./table-data-export-dialog.component";
import { IbTableDataExportAction } from "./table-data-export.component";
import { IbDataTransformer } from "./transformer";

@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSelectModule,
    MatRadioModule,
    MatTooltipModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    IbTableActionModule,
    TranslateModule.forChild(),
  ],
  exports: [
    IbTableDataExportAction,
    IbTableDataExportDialog,
    IbDataTransformer,
  ],
  declarations: [
    IbTableDataExportAction,
    IbTableDataExportDialog,
    IbDataTransformer,
  ],
  providers: [
    IbDataExportService,
    IbXLXSExportProvider,
    IbPDFExportProvider,
    IbCSVExportProvider,
  ],
})
export class IbDataExportModule {}
