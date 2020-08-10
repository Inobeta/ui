import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormControlComponent } from './dynamic-form-control/dynamic-form-control.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { FormControlService } from './form-control.service';

@NgModule({
  declarations: [DynamicFormControlComponent, DynamicFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [FormControlService],
  exports: [DynamicFormComponent, DynamicFormControlComponent]
})
export class DynamicFormsModule { }
