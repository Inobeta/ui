import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { IbDynamicFormControlComponent } from './dynamic-form-control/dynamic-form-control.component';
import { IbDynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { IbFormControlService } from './form-control.service';

@NgModule({
  declarations: [IbDynamicFormControlComponent, IbDynamicFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  providers: [IbFormControlService],
  exports: [IbDynamicFormComponent, IbDynamicFormControlComponent]
})
export class IbDynamicFormsModule { }
