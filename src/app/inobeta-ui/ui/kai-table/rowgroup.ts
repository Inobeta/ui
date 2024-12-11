import { Directive, TemplateRef } from "@angular/core";

@Directive({
    selector: '[ibKaiRowGroup]',
    standalone: false
})
export class IbKaiRowGroupDirective {
  constructor(public templateRef: TemplateRef<unknown>) {}
}
