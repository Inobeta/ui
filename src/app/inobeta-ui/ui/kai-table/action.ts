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

@NgModule({
  exports: [IbKaiTableAction],
  declarations: [IbKaiTableAction],
})
export class IbTableActionModule {}
