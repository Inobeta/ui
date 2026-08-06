import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
/** @deprecated Migration scripts toward Angular core APIs are planned no earlier than v22. */
export class IbLoadingSkeletonContainerComponent implements OnInit {
  @Input() skeletons: {
    width: string;
    height: string;
    className: string;
  }[] = []
  constructor() { }
  ngOnInit() { }
}
