import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RingGaugeAdditionalInfo } from './types';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'ring-gauge',
  standalone: true,
  imports: [MatIconModule, TranslateModule, DecimalPipe],
  template: `
    <div class="ring-gauge-container" [style.maxWidth]="maxSize()" [style.maxHeight]="maxSize()">
      <svg viewBox="0 0 120 120" class="ring-gauge-svg">
        <!-- background -->
        <circle
          class="ring-bg"
          cx="60"
          cy="60"
          [attr.r]="radius">
        </circle>

        <!-- progress -->
        <circle
          class="ring-progress"
          cx="60"
          cy="60"
          [attr.r]="radius"
          [style.stroke]="effectiveColor()"
          [style.stroke-dasharray]="circumference"
          [style.stroke-dashoffset]="dashOffset()">
        </circle>
      </svg>

      <div class="ring-gauge-content">
        @if (icon()) {
          <mat-icon
            class="ring-gauge-icon"
            [style.color]="iconColor()">
            {{ icon() }}
          </mat-icon>
        }

        <div class="ring-gauge-value" [style.color]="effectiveColor()">
          {{ value() | number:'1.0-2':'it-IT' }}
          <span class="ring-gauge-unit" [hidden]="!unit()">{{ unit() }}</span>
        </div>

        <div class="ring-gauge-additional-info">
          @if (additionalInfo()) {
            <mat-icon
              class="ring-gauge-additional-icon"
              [style.color]="additionalInfo()?.iconColor">
              {{ additionalInfo()?.icon }}
            </mat-icon>
          }

          <span
            class="ring-gauge-additional-label"
            [style.color]="additionalInfo()?.labelColor">
            {{ (additionalInfo()?.label ?? '') | translate }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .ring-gauge-container {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .ring-gauge-svg {
      width: 100%;
      height: 100%;
      display: block;
      box-shadow: none;
      transform: rotate(-90deg);
    }

    .ring-bg {
      fill: none;
      stroke: #e5e7eb;
      stroke-width: 2;
    }

    .ring-progress {
      fill: none;
      stroke-width: 6;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.35s ease, stroke 0.2s ease;
    }

    .ring-gauge-content {
      position: absolute;
      inset: 0;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .ring-gauge-icon {
      width: 48px;
      height: 48px;
      font-size: 48px;
    }

    .ring-gauge-value {
      font-size: 1.875rem;   /* equivalente a text-3xl */
      line-height: 2.25rem;
      font-weight: 500;      /* equivalente a font-medium */
    }

    .ring-gauge-unit {
      font-size: 1.25rem;    /* equivalente a text-xl */
      line-height: 1.75rem;
      font-weight: 400;      /* equivalente a font-normal */
    }

    .ring-gauge-additional-info {
      display: flex;
      align-items: center;
      gap: 0.25rem;          /* equivalente a gap-1 */
      font-size: 1rem;       /* circa text-md */
      line-height: 1.5rem;
    }

    .ring-gauge-additional-icon {
      width: 18px;
      height: 18px;
      font-size: 18px;
    }

    .ring-gauge-additional-label {
      display: inline-block;
    }
  `]
})
export class RingGaugeComponent {
  icon = input<string | undefined>(undefined);
  iconColor = input<string | undefined>(undefined);
  unit = input<string>('');

  value = input<number>(0);
  progress = input<number>(0);
  dynamicColor = input<string>('');
  additionalInfo = input<RingGaugeAdditionalInfo | null>(null);
  maxSize = input<string>('300px');

  radius = 57;
  circumference = 2 * Math.PI * this.radius;

  dashOffset = computed(() => {
    const v = Math.max(0, Math.min(100, this.progress()));
    return this.circumference * (1 - v / 100);
  });

  effectiveColor = computed(() => this.dynamicColor() || '#14b8a6');
}
