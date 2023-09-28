import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: "[ibCellDef]",
})
export class IbCellDef {
  constructor(public templateRef: TemplateRef<unknown>) {}
}

@Directive({
  selector: "[ib-context-column]",
  host: {
    "[class]": '"ib-table-context-column"',
  },
})
export class IbContextColumn {}
