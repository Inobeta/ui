import {
  Component,
  Directive,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { IbFormControlInterface } from "../../forms/controls/form-control-base";
import { IbDynamicFormControlComponent } from "../../forms/dynamic-form-control/dynamic-form-control.component";

@Directive({
  selector: "[formControlHost]",
})
export class IbFormControlDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}

/** @deprecated */
@Component({
  selector: "ib-material-form-control",
  templateUrl: "./material-form-control.component.html",
})
export class IbMaterialFormControlComponent
  extends IbDynamicFormControlComponent
  implements OnInit, OnChanges
{
  @ViewChild(IbFormControlDirective, { static: true })
  formControlHost: IbFormControlDirective;
  @ViewChild("formControlErrors", { static: true })
  formControlErrors: TemplateRef<any>;

  componentRef;
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
}
