import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'ib-loading-skeleton-container',
  template: `
  <div class="ib-skeleton-container">
    @for (s of skeletons; track s) {
      <ib-loading-skeleton-rect
        [width]="s.width"
        [height]="s.height"
        [className]="s.className"
      ></ib-loading-skeleton-rect>
    }
  </div>
  `,
  styles: [`
  :host{
    flex: 1;
    width: 100%;
  }
  .ib-skeleton-container{
    display: flex;
    flex-direction: column;
  }

  `],
  standalone: false
})
/** @deprecated this element will be removed in v21 */
export class IbLoadingSkeletonContainerComponent implements OnInit {
  @Input() skeletons: {
    width: string;
    height: string;
    className: string;
  }[] = []
  constructor() { }
  ngOnInit() { }
}
