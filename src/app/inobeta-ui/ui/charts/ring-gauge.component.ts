import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RingGaugeAdditionalInfo } from './types';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ring-gauge',
  standalone: true,
  imports: [MatIconModule, TranslateModule],
  template: `
    <div class="relative size-full" [style.maxWidth]="maxSize()" [style.maxHeight]="maxSize()">
      <svg viewBox="0 0 120 120" class="shadow-none" style="transform: rotate(-90deg);">
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

      <div class="flex flex-col items-center justify-center absolute inset-0 pointer-events-none gap-2">
        @if(icon()){
          <mat-icon class="icon" [style.color]="iconColor()"
          style="width:48px; height:48px; font-size:48px;">
          {{ icon() }}
        </mat-icon>}

        <div class="value text-3xl font-medium" [style.color]="effectiveColor()">
          {{ value() }}
          <span class="unit text-xl font-normal" [hidden]="!unit()">{{ unit() }}</span>
        </div>
          <div class="flex items-center gap-1 text-md">
          @if(additionalInfo()){
              <mat-icon
              style="width:18px; height:18px; font-size:18px;"
              [style.color]="additionalInfo()?.iconColor">
              {{ additionalInfo()?.icon }}
              </mat-icon>
          }
          <span [style.color]="additionalInfo()?.labelColor">
              {{ additionalInfo()?.label ?? ''| translate }}
          </span>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .ring-bg { fill: none; stroke: #e5e7eb; stroke-width: 2; }
    .ring-progress { fill: none; stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 0.35s ease, stroke 0.2s ease; }
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
