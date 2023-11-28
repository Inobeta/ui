import { Directive, Input } from "@angular/core";

@Directive({ selector: '[ibLoading]' })
export class IbLoadingStubDirective {
  @Input('ibLoading') config = {
    size: 1,
    width: 'rand',
    height: '20px',
    className: '',
    endpoint: null
  }
  constructor() {}
}
