import {
  contentChildren,
  Directive,
  input,
  NgModule,
  Optional,
  signal,
  Signal,
  TemplateRef,
  viewChild,
  ViewContainerRef
} from "@angular/core";

@Directive({
  selector: "[ibTableAction]",
  standalone: false
})
export class IbKaiTableAction {
  kind = input<string>("default");
  /**
   * The action template. Since this directive is applied to `<ng-template>`,
   * the TemplateRef is constructor-injected; a `viewChild` query cannot
   * resolve it because attribute directives have no view of their own.
   */
  readonly templateRef: Signal<TemplateRef<any> | null>;
  constructor(
    @Optional() public _templateRef: TemplateRef<any>,
    public viewContainerRef: ViewContainerRef
  ) {
    this.templateRef = signal(_templateRef ?? null).asReadonly();
  }
}

@Directive({
  selector: 'ib-table-action-group, [ib-table-action-group]',
  standalone: false
})
export class IbKaiTableActionGroup {
  readonly templateRef = viewChild.required(TemplateRef);
  readonly actions = contentChildren(IbKaiTableAction);
}

@NgModule({
  exports: [IbKaiTableAction, IbKaiTableActionGroup],
  declarations: [IbKaiTableAction, IbKaiTableActionGroup],
})
export class IbTableActionModule { }
