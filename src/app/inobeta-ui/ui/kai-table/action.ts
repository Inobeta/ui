import {
  Directive,
  NgModule,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";

@Directive({
  selector: "[ibTableAction]",
})
export class IbKaiTableAction {
  @ViewChild(TemplateRef) templateRef;
  constructor(
    @Optional() public _templateRef: TemplateRef<any>,
    public viewContainerRef: ViewContainerRef
  ) {
    this.templateRef = this.templateRef ?? this._templateRef;
  }
}

@Directive({
  selector: "ib-table-action-group, [ib-table-action-group]",
})
export class IbKaiTableActionGroup {}

@NgModule({
  exports: [IbKaiTableAction, IbKaiTableActionGroup],
  declarations: [IbKaiTableAction, IbKaiTableActionGroup],
})
export class IbTableActionModule {}
