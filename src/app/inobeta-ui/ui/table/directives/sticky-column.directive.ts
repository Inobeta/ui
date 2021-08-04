import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';
import { element } from 'protractor';

@Directive({
  selector: '[ibStickyColumn]'
})
export class StickyColumnDirective {
  @Input() ibStickyColumn: any = {};

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngAfterContentChecked() {
    if (!this.ibStickyColumn.sticky) {
      return;
    }
    console.log('update')

    const el: Element = this.el.nativeElement;
    
    if (this.ibStickyColumn.sticky === 'end') {
      const elements = document.querySelectorAll('th.ib-column-sticky.ib-column-sticky-end');
      this.renderer.setStyle(el, 'right', this.calcOffset(Array.from(elements).reverse()) + 'px');
      this.renderer.addClass(el, 'ib-column-sticky');
      this.renderer.addClass(el, 'ib-column-sticky-end');
      return;
    }
    
    const elements = document.querySelectorAll('th.ib-column-sticky:not(.ib-column-sticky-end)');
    this.renderer.setStyle(el, 'left', this.calcOffset(Array.from(elements)) + 'px');
    this.renderer.addClass(el, 'ib-column-sticky');
  }

  private calcOffset(elements: Element[]) {
    let acc = 0;
    for (const el of elements) {
      if (el.id.includes(this.ibStickyColumn.key)) {
        break;
      }
      acc += el.getBoundingClientRect().width;
    }
    return acc;
  }
}
