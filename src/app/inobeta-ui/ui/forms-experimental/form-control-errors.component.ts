import { Component, computed, inject, input } from "@angular/core";
import { FormGroupDirective } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  standalone: true,
  imports: [TranslateModule],
  selector: "ib-form-control-errors",
  template: `
    @if (control().hasError("required")) {
      {{ "shared.ibFormsExperimental.errors.required" | translate }}
    } @else if (control().hasError("minlength")) {
      {{
        "shared.ibFormsExperimental.errors.minlength"
          | translate: { v: control().errors.minlength.requiredLength }
      }}
    } @else if (control().hasError("maxlength")) {
      {{
        "shared.ibFormsExperimental.errors.maxlength"
          | translate: { v: control().errors.maxlength.requiredLength }
      }}
    } @else if (control().hasError("min")) {
      {{
        "shared.ibFormsExperimental.errors.min" | translate: { v: control().errors.min.min }
      }}
    } @else if (control().hasError("max")) {
      {{
        "shared.ibFormsExperimental.errors.max" | translate: { v: control().errors.max.max }
      }}
    } @else if (control().hasError("email")) {
      {{ "shared.ibFormsExperimental.errors.email" | translate }}
    } @else if (control().hasError("customError")) {
      {{
        control().errors.customError.message
          | translate: control().errors.customError.params
      }}
    }
  `,
})
export class IbFormControlErrors {
  formDirective = inject(FormGroupDirective);
  for = input.required<string>();
  control = computed(() => this.formDirective.form.get(this.for()));
}
