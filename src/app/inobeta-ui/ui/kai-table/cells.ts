import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[ibCellDef]",
})
export class IbCellDef {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
