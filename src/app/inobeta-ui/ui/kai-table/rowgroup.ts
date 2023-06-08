import { Directive, TemplateRef } from "@angular/core";

@Directive({
  selector: '[ibKaiRowGroup]'
})
export class IbKaiRowGroupDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
