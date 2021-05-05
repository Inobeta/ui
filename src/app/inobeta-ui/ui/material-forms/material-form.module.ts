import { NgModule } from '@angular/core';
import { IbMaterialFormComponent } from './material-form/material-form.component';
import { IbMaterialFormControlComponent, IbFormControlDirective } from './material-form-control/material-form-control.component';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatFormFieldModule, MatOptionModule,
  MatSelectModule, MatRadioModule, MatCheckboxModule, MatInputModule,
  MatDatepickerModule, MatAutocompleteModule, MatIconModule,
  MatGridListModule, MatTooltipModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';
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
import { MatMomentDateModule } from '@angular/material-moment-adapter';

const entryComponents = [
  IbMatTextboxComponent,
  IbMatDropdownComponent,
  IbMatRadioComponent,
  IbMatCheckboxComponent,
  IbMatDatepickerComponent,
  IbMatAutocompleteComponent,
  IbMatLabelComponent,
  IbMatTextareaComponent,
  IbMatButtonComponent,
  IbMatPaddingComponent
];
const components = [
  ...entryComponents,
  IbMaterialFormComponent,
  IbMaterialFormControlComponent,
  IbFormControlDirective
];


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
    MatMomentDateModule,
    MatTooltipModule
  ],
  exports: [
    ...components
  ],
  declarations: [
    ...components
  ],
  providers: [],
  entryComponents: [
    ...entryComponents
  ]
})
export class IbMaterialFormModule { }
