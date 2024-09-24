import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatOptionModule,
} from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslateModule } from "@ngx-translate/core";
import { IbFormPipeModule } from "../forms/forms.pipes";
import { IbModalModule } from "../modal/modal.module";
import { IbMatAutocompleteComponent } from "./controls/autocomplete";
import { IbMatButtonComponent } from "./controls/button";
import { IbMatCheckboxComponent } from "./controls/checkbox";
import { IbMatDatepickerComponent } from "./controls/datepicker";
import { IbMatDropdownComponent } from "./controls/dropdown";
import { IbMatLabelComponent } from "./controls/label";
import { IbMatPaddingComponent } from "./controls/padding";
import { IbMatRadioComponent } from "./controls/radio";
import { IbMatSlideToggleComponent } from "./controls/slide-toggle";
import { IbMatTextareaComponent } from "./controls/textarea";
import { IbMatTextboxComponent } from "./controls/textbox";
import { IbMatDateAdapter, IbMatDatepickerI18n } from "./intl/datepicker.intl";
import { IbMaterialFormArrayComponent } from "./material-form-array/material-form-array.component";
import {
  IbFormControlDirective,
  IbMaterialFormControlComponent,
} from "./material-form-control/material-form-control.component";
import { IbMaterialFormComponent } from "./material-form/material-form.component";

const components = [
  IbMatTextboxComponent,
  IbMatDropdownComponent,
  IbMatRadioComponent,
  IbMatCheckboxComponent,
  IbMatDatepickerComponent,
  IbMatAutocompleteComponent,
  IbMatLabelComponent,
  IbMatTextareaComponent,
  IbMatButtonComponent,
  IbMatPaddingComponent,
  IbMatSlideToggleComponent,
  IbMaterialFormComponent,
  IbMaterialFormControlComponent,
  IbFormControlDirective,
  IbMaterialFormArrayComponent,
];

export function ibMatDatepickerTranslate() {
  return new IbMatDatepickerI18n().getDateFormats();
}

/** @deprecated */
@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forChild({
      extend: true,
    }),
    MatButtonModule,
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatInputModule,
    MatDatepickerModule,
    MatAutocompleteModule,
    MatIconModule,
    MatGridListModule,
    MatTooltipModule,
    MatSlideToggleModule,
    IbModalModule,
    IbFormPipeModule,
  ],
  exports: [...components],
  declarations: [...components],
  providers: [
    {
      provide: DateAdapter,
      useClass: IbMatDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useFactory: ibMatDatepickerTranslate },
  ],
})
export class IbMaterialFormModule {}
