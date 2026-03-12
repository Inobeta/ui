import { Directive, TemplateRef, ViewContainerRef, input, effect } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Directive({
  selector: '[appLoading]',
})
export class AppLoadingDirective {
  isLoading = input.required<boolean>({ alias: 'appLoading' });
  type = input<'spinner' | 'bar'>('spinner');
  diameter = input<number>(60);

  constructor(
    private tpl: TemplateRef<unknown>,
    private vcr: ViewContainerRef
  ) {
    effect(() => {
      this.render();
    });
  }

  private render() {
    this.vcr.clear();
    this.setTemplate(this.isLoading() ? this.type() : 'none');
  }

  private setTemplate(type: 'spinner' | 'bar' | 'none') {
    switch (type) {
      case 'spinner':
        this.setSpinnerTemplate();
        break;
      case 'bar':
        this.setBarTemplate();
        break;
      default:
        this.vcr.createEmbeddedView(this.tpl);
    }
  }

  private setSpinnerTemplate() {
    const ref = this.vcr.createComponent(MatProgressSpinner);
    ref.setInput('mode', 'indeterminate');
    ref.setInput('diameter', this.diameter());
    ref.location.nativeElement.classList.add('app-loading');
  }

  private setBarTemplate() {
    const ref = this.vcr.createComponent(MatProgressBar);
    ref.setInput('mode', 'indeterminate');
    ref.location.nativeElement.classList.add('app-loading');
  }

}
