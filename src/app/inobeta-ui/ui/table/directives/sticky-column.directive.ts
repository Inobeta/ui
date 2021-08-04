import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[ibStickyColumn]'
})
export class StickyColumnDirective {
  @Input() ibStickyColumn: any = {};

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngAfterViewChecked() {
    if (!this.ibStickyColumn.sticky) {
      return;
    }
    
    const el: HTMLElement = this.el.nativeElement;

    if (el.tagName === 'TH' && !Boolean(el.id)) {
      el.id = 'th-' + this.ibStickyColumn.key;
    }
    
    if (this.ibStickyColumn.sticky === 'end') {
      const elements = document.querySelectorAll('th.ib-column-sticky.ib-column-sticky-end');
      this.renderer.setStyle(el, 'position', 'sticky');
      this.renderer.setStyle(el, 'right', this.calcOffset(Array.from(elements).reverse()) + 'px');
      this.renderer.setStyle(el, 'z-index', el.tagName === 'TH' ? '110' : '108');
      this.renderer.addClass(el, 'ib-column-sticky');
      this.renderer.addClass(el, 'ib-column-sticky-end');
      return;
    }
    
    const elements = document.querySelectorAll('th.ib-column-sticky:not(.ib-column-sticky-end)');
    const offset = this.calcOffset(Array.from(elements));
    this.renderer.setStyle(el, 'position', 'sticky');
    this.renderer.setStyle(el, 'left', offset + 'px');
    this.renderer.setStyle(el, 'z-index', el.tagName === 'TH' ? '110' : '108');
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
