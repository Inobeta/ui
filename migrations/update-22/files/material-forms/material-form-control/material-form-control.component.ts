import {
  Component,
  Directive,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ChangeDetectionStrategy
} from "@angular/core";
import { ComponentRef } from "@angular/core";
import { IbFormControlInterface } from "../../forms/controls/form-control-base";
import { IbDynamicFormControlComponent } from "../../forms/dynamic-form-control/dynamic-form-control.component";

@Directive({
    selector: "[formControlHost]",
    standalone: false
})
export class IbFormControlDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

@Component({
    selector: "ib-material-form-control",
    templateUrl: "./material-form-control.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class IbMaterialFormControlComponent
  extends IbDynamicFormControlComponent
  implements OnInit, OnChanges
{
  @ViewChild(IbFormControlDirective, { static: true })
  formControlHost!: IbFormControlDirective;
  @ViewChild("formControlErrors", { static: true })
  formControlErrors!: TemplateRef<unknown>;

  componentRef!: ComponentRef<IbFormControlInterface>;
  ngOnChanges(changes: SimpleChanges): void {
    const form = changes["form"];
    if (form && !form.isFirstChange()) {
      this.componentRef.instance.data = {
        ...this.componentRef.instance.data,
        form: form.currentValue,
      };
    }
  }
  ngOnInit(): void {
    this.loadComponent();
  }

  loadComponent() {
    if (!this.base.control) {
      return;
    }

    const viewContainerRef = this.formControlHost.viewContainerRef;
    viewContainerRef.clear();

    this.componentRef =
      viewContainerRef.createComponent<IbFormControlInterface>(
        this.base.control.component
      );
    this.componentRef.setInput('data', {
      ...this.base.control.data,
      form: this.form,
      self: this.self,
      hasError: this.hasError,
      formControlErrors: this.formControlErrors,
    });
  }

  getMinLength(): unknown {
    return this.getErrorValue('minlength', 'requiredLength');
  }

  getMaxLength(): unknown {
    return this.getErrorValue('maxlength', 'requiredLength');
  }

  getMin(): unknown {
    return this.getErrorValue('min', 'min');
  }

  getMax(): unknown {
    return this.getErrorValue('max', 'max');
  }

  getDateParseError(): unknown {
    return this.getErrorValue('matDatepickerParse', 'matDatepickerParse');
  }

  getCustomError(): { message: string; params?: object } | null {
    const error = this.self.errors?.['customError'];
    if (!error || typeof error !== 'object' || !('message' in error)) {
      return null;
    }
    const { message, params } = error as { message: unknown; params: unknown };
    if (typeof message !== 'string') {
      return null;
    }
    if (params === undefined) {
      return { message };
    }
    return typeof params === 'object' && params !== null ? { message, params } : null;
  }

  private getErrorValue(errorCode: string, property: string): unknown {
    const error = this.self.errors?.[errorCode];
    return error && typeof error === 'object' && property in error
      ? error[property]
      : undefined;
  }
}
