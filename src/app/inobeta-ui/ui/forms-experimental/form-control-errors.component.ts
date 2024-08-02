import { Component, computed, inject, input } from "@angular/core";
import { FormGroupDirective } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  standalone: true,
  imports: [TranslateModule],
  selector: "ib-form-control-errors",
  template: `
    @if (control().hasError("required")) {
      <span>{{ "shared.ibForms.errors.required" | translate }}</span>
    } @else if (control().hasError("minlength")) {
      <span>
        {{
          "shared.ibForms.errors.minlength"
            | translate: { v: control().errors.minlength.requiredLength }
        }}
      </span>
    } @else if (control().hasError("maxlength")) {
      <span>
        {{
          "shared.ibForms.errors.maxlength"
            | translate: { v: control().errors.maxlength.requiredLength }
        }}
      </span>
    } @else if (control().hasError("min")) {
      <span>
        {{
          "shared.ibForms.errors.min"
            | translate: { v: control().errors.min.min }
        }}
      </span>
    } @else if (control().hasError("max")) {
      <span>
        {{
          "shared.ibForms.errors.max"
            | translate: { v: control().errors.max.max }
        }}
      </span>
    } @else if (control().hasError("email")) {
      <span>
        {{ "shared.ibForms.errors.email" | translate }}
      </span>
    } @else if (control().hasError("customError")) {
      <span>
        {{
          control().errors.customError.message
            | translate: control().errors.customError.params
        }}
      </span>
    }
  `,
})
export class FormControlErrorsComponent {
  formDirective = inject(FormGroupDirective);
  for = input.required<string>();
  control = computed(() => this.formDirective.form.get(this.for()));
}
