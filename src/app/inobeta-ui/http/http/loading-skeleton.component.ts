import { Component, ElementRef, Input } from "@angular/core";

@Component({
  selector: 'ib-loading-skeleton-rect',
  host: {
    'class': 'pulse'
  },
  template: ``,
  styles: [`
    :host {
      display: block;
      width: var(--skeleton-rect-width);
      height: var(--skeleton-rect-height);
      background: rgb(239, 241, 246) no-repeat;
      margin-bottom: 5px;
    }

  `]
})
export class IbLoadingSkeletonRectComponent {
  @Input() width: string;
  @Input() height: string;
  @Input() className: string;

  constructor(private host: ElementRef<HTMLElement>) { }

  ngOnInit() {
    const host = this.host.nativeElement;

    if (this.className) {
      host.classList.add(this.className);
    }

    host.style.setProperty('--skeleton-rect-width', this.width ?? '100%');
    host.style.setProperty('--skeleton-rect-height', this.height ?? '20px');
  }
}
