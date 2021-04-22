import { Component, OnInit, Directive, ViewContainerRef, ViewChild, ComponentFactoryResolver, TemplateRef, OnChanges, SimpleChanges } from '@angular/core';
import { IbDynamicFormControlComponent } from '../../forms/dynamic-form-control/dynamic-form-control.component';
import { IbFormControlInterface } from '../../forms/controls/form-control-base';


@Directive({
  selector: '[formControlHost]',
})
export class IbFormControlDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}


@Component({
  selector: 'ib-material-form-control',
  templateUrl: './material-form-control.component.html',
})
export class IbMaterialFormControlComponent extends IbDynamicFormControlComponent implements OnInit, OnChanges {
  @ViewChild(IbFormControlDirective, {static: true}) formControlHost: IbFormControlDirective;
  @ViewChild('formControlErrors', {static: true}) formControlErrors: TemplateRef<any>;

  componentRef;
  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
    super();
  }
  ngOnChanges(changes: SimpleChanges): void {
    const form = changes['form'];
    if (form && !form.isFirstChange()) {
      this.componentRef.instance.data = {
        ...this.componentRef.instance.data,
        form: form.currentValue
      };
    }
  }
  ngOnInit(): void {
    this.loadComponent();
  }

  loadComponent() {
    if (!this.base.control) { return; }

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.base.control.component);

    const viewContainerRef = this.formControlHost.viewContainerRef;

    viewContainerRef.clear();

    this.componentRef = viewContainerRef.createComponent<IbFormControlInterface>(componentFactory);
    this.componentRef.instance.data = {
      ...this.base.control.data,
      form: this.form,
      self: this.self,
      hasError: this.hasError,
      formControlErrors: this.formControlErrors
    };
  }

}


