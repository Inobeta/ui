import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { IbDynamicFormArrayComponent } from "./dynamic-form-array/dynamic-form-array.component";
import { IbDynamicFormControlComponent } from "./dynamic-form-control/dynamic-form-control.component";
import { IbDynamicFormComponent } from "./dynamic-form/dynamic-form.component";
import { IbFormControlService } from "./form-control.service";
import { IbFormPipeModule } from "./forms.pipes";

/** @deprecated */
@NgModule({
  declarations: [
    IbDynamicFormControlComponent,
    IbDynamicFormComponent,
    IbDynamicFormArrayComponent,
  ],
  imports: [CommonModule, ReactiveFormsModule, IbFormPipeModule],
  providers: [IbFormControlService],
  exports: [
    IbDynamicFormComponent,
    IbDynamicFormControlComponent,
    IbDynamicFormArrayComponent,
  ],
})
export class IbDynamicFormsModule {}
