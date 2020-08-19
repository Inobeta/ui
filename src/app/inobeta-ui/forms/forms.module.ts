import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormControlComponent } from './dynamic-form-control/dynamic-form-control.component';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { FormControlService } from './form-control.service';
import { MaterialFormComponent } from './material-form/material-form.component';
import { MaterialFormControlComponent } from './material-form-control/material-form-control.component';
import { CustomMaterialModule } from '../material.module';

@NgModule({
  declarations: [DynamicFormControlComponent, DynamicFormComponent, MaterialFormComponent, MaterialFormControlComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomMaterialModule
  ],
  providers: [FormControlService],
  exports: [DynamicFormComponent, DynamicFormControlComponent, MaterialFormComponent, MaterialFormControlComponent]
})
export class DynamicFormsModule { }
