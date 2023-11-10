import { Platform } from "@angular/cdk/platform";
import { PortalModule } from "@angular/cdk/portal";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDividerModule } from "@angular/material/divider";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSliderModule } from "@angular/material/slider";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { IbTableActionModule } from "../kai-table/action";
import { IbMatDateAdapter } from "../material-forms/intl/datepicker.intl";
import { ibMatDatepickerTranslate } from "../material-forms/material-form.module";
import { IbFilterActions } from "./filter-actions/filter-actions.component";
import { IbFilterButton } from "./filter-button/filter-button.component";
import { IbFilter } from "./filter.component";
import { IbFilterBase } from "./filters/base/filter-base";
import { IbDateFilter } from "./filters/date/filter-date.component";
import { IbNumberFilter } from "./filters/number/filter-number.component";
import { IbSearchBar } from "./filters/search-bar/search-bar.component";
import { IbTagFilter } from "./filters/tag/filter-tag.component";
import { IbTextFilter } from "./filters/text/filter-text.component";

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
    IbTableActionModule,
    MatTooltipModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  exports: [
    IbFilter,
    IbFilterBase,
    IbFilterButton,
    IbTextFilter,
    IbTagFilter,
    IbNumberFilter,
    IbDateFilter,
    IbFilterActions,
    IbSearchBar,
  ],
  declarations: [
    IbFilter,
    IbFilterBase,
    IbFilterButton,
    IbTextFilter,
    IbTagFilter,
    IbNumberFilter,
    IbDateFilter,
    IbFilterActions,
    IbSearchBar,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: IbMatDateAdapter,
      deps: [MAT_DATE_LOCALE, Platform],
    },
    {
      provide: MAT_DATE_FORMATS,
      deps: [TranslateService],
      useFactory: ibMatDatepickerTranslate,
    },
  ],
})
export class IbFilterModule {}
