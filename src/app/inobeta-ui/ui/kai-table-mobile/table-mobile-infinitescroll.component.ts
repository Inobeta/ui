import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  input,
  output,
  signal
} from '@angular/core';


@Component({
  selector: 'ib-kai-table-mobile-infinitescroll',
  standalone: true,
  imports: [],
  template: `
    <div #scrollAnchor class="ib-kai-table-mobile__scroll-anchor"></div>
  `,
  styles: [`
    .ib-kai-table-mobile__scroll-anchor {
      width: 100%;
      height: 1px;
    }
  `]
})
export class IbKaiTableMobileInfiniteScrollComponent implements AfterViewInit, OnDestroy {

  hasMoreRows = input<boolean>(false);
  data = input<any[]>([]);
  visibleCountChanged = output<number>();

  @ViewChild('scrollAnchor') scrollAnchor?: ElementRef<HTMLElement>;
  pageSize = input(20);

  private observer?: IntersectionObserver;
  private visibleCount = signal(this.pageSize());

  constructor() {
    effect(() => {
      this.data();
      this.pageSize();
      this.visibleCount.set(this.pageSize());
    });

    effect(() => {
      this.hasMoreRows();
      queueMicrotask(() => this.watchAnchor());
    });
    effect(() => {
      this.visibleCount();
      this.visibleCountChanged.emit(this.visibleCount());
    });
  }

  ngAfterViewInit(): void {
    this.setupInfiniteScroll();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private setupInfiniteScroll(): void {
    this.observer?.disconnect();

    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting && this.hasMoreRows()) {
          this.loadMore();
        }
      }
    }, {
      root: null,
      rootMargin: '200px 0px',
      threshold: 0,
    });
    this.watchAnchor();
  }

  private watchAnchor = () => {
    this.observer?.disconnect();
    const anchor = this.scrollAnchor?.nativeElement;
    if (anchor && this.hasMoreRows()) {
      this.observer?.observe(anchor);
    }
  };

  private loadMore(): void {
    const total = this.data()?.length ?? 0;
    const next = Math.min(this.visibleCount() + this.pageSize(), total);
    this.visibleCount.set(next);
  }
}
