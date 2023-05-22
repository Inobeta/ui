import { PortalModule } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatSelectModule } from "@angular/material/select";
import { MatRadioModule } from "@angular/material/radio";
import { IbFilterText } from "./filters/text/filter-text.component";
import { IbFilterTag } from "./filters/tag/filter-tag.component";
import { IbFilter } from "./filter.component";
import { MatDividerModule } from "@angular/material/divider";
import { TranslateModule } from "@ngx-translate/core";
import { MatListModule } from "@angular/material/list";
import { MatSliderModule } from "@angular/material/slider";
import { IbFilterNumber } from "./filters/number/filter-number.component";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { IbFilterButton } from "./filter-button/filter-button.component";
import { IbFilterActions } from "./filter-actions/filter-actions.component";
import { IbApplyFilterButton } from "./filter-actions/apply-filter-button.component";
import { IbFilterDate } from "./filters/date/filter-date.component";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { IbFilterBase } from "./filters/base/filter-base";

@NgModule({
  imports: [
    CommonModule,
    PortalModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    MatChipsModule,
    MatFormFieldModule,
    MatDividerModule,
    MatListModule,
    MatSliderModule,
    MatRadioModule,
    MatDatepickerModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  exports: [
    IbFilter,
    IbFilterBase,
    IbFilterButton,
    IbFilterText,
    IbFilterTag,
    IbFilterNumber,
    IbFilterDate,
    IbFilterActions,
    IbApplyFilterButton,
  ],
  declarations: [
    IbFilter,
    IbFilterBase,
    IbFilterButton,
    IbFilterText,
    IbFilterTag,
    IbFilterNumber,
    IbFilterDate,
    IbFilterActions,
    IbApplyFilterButton,
  ]
})
export class IbFilterModule {}
