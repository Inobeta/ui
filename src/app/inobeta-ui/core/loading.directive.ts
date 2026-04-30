import { Component, Directive, TemplateRef, ViewContainerRef, input, effect, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="app-skeleton-container">
      @for (width of lines; track $index) {
        <div class="app-skeleton-line" [style.width.%]="width"></div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    .app-skeleton-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 100%;
      padding: 8px 0;
    }
    .app-skeleton-line {
      display: block;
      height: 14px;
      min-height: 14px;
      border-radius: 4px;
      background: linear-gradient(
        90deg,
        var(--mat-sys-surface-variant, rgba(0, 0, 0, 0.06)) 25%,
        var(--mat-sys-surface-container-high, rgba(0, 0, 0, 0.12)) 37%,
        var(--mat-sys-surface-variant, rgba(0, 0, 0, 0.06)) 63%
      );
      background-size: 400% 100%;
      animation: skeleton-shimmer 1.4s ease infinite;
    }
    @keyframes skeleton-shimmer {
      0% { background-position: 100% 50%; }
      100% { background-position: 0 50%; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSkeletonComponent {
  rows = input<number>(0);

  // ⚠️ Cambia qui: era una funzione, deve essere una proprietà calcolata UNA volta
  protected lines: number[] = this.generateLines();

  private generateLines(): number[] {
    const count = this.rows() || this.randomInt(3, 6);
    return Array.from({ length: count }, () => this.randomInt(40, 100));
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

@Directive({
  selector: '[appLoading]',
})
export class AppLoadingDirective {
  isLoading = input.required<boolean>({ alias: 'appLoading' });
  type = input<'spinner' | 'bar' | 'skeleton'>('skeleton', { alias: 'appLoadingType' });
  diameter = input<number>(60, { alias: 'appLoadingDiameter' });
  skeletonRows = input<number>(0, { alias: 'appLoadingSkeletonRows' });

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

  private setTemplate(type: 'spinner' | 'bar' | 'skeleton' | 'none') {
    switch (type) {
      case 'spinner':
        this.setSpinnerTemplate();
        break;
      case 'bar':
        this.setBarTemplate();
        break;
      case 'skeleton':
        this.setSkeletonTemplate();
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

  private setSkeletonTemplate() {
    const ref = this.vcr.createComponent(AppSkeletonComponent);
    ref.setInput('rows', this.skeletonRows());
    ref.location.nativeElement.classList.add('app-loading');
  }
}
