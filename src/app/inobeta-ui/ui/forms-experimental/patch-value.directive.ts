import { Directive, inject, Input } from "@angular/core";
import { FormGroupDirective } from "@angular/forms";

@Directive({ standalone: true, selector: "[ibPatchFormValue]" })
export class IbPatchFormValue {
  formDirective = inject(FormGroupDirective);
  @Input()
  set ibPatchFormValue(value: Record<string, any>) {
    if (!value) {
      return;
    }
    if (!this.formDirective) {
      throw Error('ibPatchFormValue must be placed in the same element that contains a formGroup directive')
    }
    this.formDirective.form.patchValue(value, { emitEvent: false });
  }
}
