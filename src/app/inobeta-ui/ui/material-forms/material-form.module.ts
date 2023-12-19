import { NgModule } from '@angular/core';
import { IbMaterialFormComponent } from './material-form/material-form.component';
import { IbMaterialFormControlComponent, IbFormControlDirective } from './material-form-control/material-form-control.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { IbMaterialFormArrayComponent } from './material-form-array/material-form-array.component';
import { IbFormPipeModule } from '../forms/forms.pipes';

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
    PlatformModule,
    IbFormPipeModule
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
