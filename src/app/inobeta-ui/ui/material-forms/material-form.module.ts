import { NgModule } from '@angular/core';
import { IbMaterialFormComponent } from './material-form/material-form.component';
import { IbMaterialFormControlComponent, IbFormControlDirective } from './material-form-control/material-form-control.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatLegacyOptionModule as MatOptionModule } from '@angular/material/legacy-core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FlexLayoutModule } from '@Inobeta/flex-layout';
import { IbMatTextboxComponent } from './controls/textbox';
import { IbMatDropdownComponent } from './controls/dropdown';
import { IbMatRadioComponent } from './controls/radio';
import { IbMatCheckboxComponent } from './controls/checkbox';
import { IbMatDatepickerComponent } from './controls/datepicker';
import { IbMatAutocompleteComponent } from './controls/autocomplete';
import { IbMatLabelComponent } from './controls/label';
import { IbMatTextareaComponent } from './controls/textarea';
import { IbMatButtonComponent } from './controls/button';
import { IbMatPaddingComponent } from './controls/padding';
import { IbMatSlideToggleComponent } from './controls/slide-toggle';
import { IbMatDateAdapter, IbMatDatepickerI18n } from './intl/datepicker.intl';
import { IbModalModule } from '../modal/modal.module';
import { Platform, PlatformModule } from '@angular/cdk/platform';

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
  IbFormControlDirective
];


export function ibMatDatepickerTranslate(translateService: TranslateService) {
  return new IbMatDatepickerI18n(translateService).getDateFormats();
}


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule.forChild({
      extend: true
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
    FlexLayoutModule,
    MatTooltipModule,
    MatSlideToggleModule,
    IbModalModule,
    PlatformModule
  ],
  exports: [
    ...components
  ],
  declarations: [
    ...components
  ],
  providers: [
    { provide: DateAdapter, useClass: IbMatDateAdapter, deps: [MAT_DATE_LOCALE, Platform] },
    { provide: MAT_DATE_FORMATS, deps: [TranslateService], useFactory: ibMatDatepickerTranslate},
  ]
})
export class IbMaterialFormModule { }
