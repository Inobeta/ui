import {
  contentChildren,
  Directive,
  input,
  NgModule,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from "@angular/core";

@Directive({
  selector: "[ibTableAction]",
  standalone: false
})
export class IbKaiTableAction {
  kind = input<string>("default");
  @ViewChild(TemplateRef) templateRef;
  constructor(
    @Optional() public _templateRef: TemplateRef<any>,
    public viewContainerRef: ViewContainerRef
  ) {
    this.templateRef = this.templateRef ?? this._templateRef;
  }
}

@Directive({
  selector: 'ib-table-action-group, [ib-table-action-group]',
  standalone: false
})
export class IbKaiTableActionGroup {
  @ViewChild(TemplateRef, { static: true }) templateRef!: TemplateRef<any>;
  readonly actions = contentChildren(IbKaiTableAction);
}

@NgModule({
  exports: [IbKaiTableAction, IbKaiTableActionGroup],
  declarations: [IbKaiTableAction, IbKaiTableActionGroup],
})
export class IbTableActionModule { }
