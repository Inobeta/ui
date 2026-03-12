import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SingleValueAdditionalInfo } from './types';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'single-value',
  standalone: true,
  imports: [TranslateModule, MatIconModule],
  template: `
  @if(variant() === 'header'){
    <div class="single-value-header w-full h-full rounded-xl p-4 flex flex-col gap-3"
      [style.background-color]="backgroundColor()"
      [style.color]="fontColor()">

      <div class="flex gap-3 items-center mb-2">
        @if(icon()){
          <div class="flex items-center justify-center">
            <mat-icon
              style="width:48px; height:48px; font-size:48px;"
              [style.color]="iconColor()">
              {{ icon() }}
            </mat-icon>
          </div>
        }

        <div class="flex flex-col">
          <div class="text-xl">{{ title() | translate }}</div>

          @if(additionalInfo()){
            <div class="flex items-center gap-1 text-md">
              @if(additionalInfo()?.icon){
                <mat-icon
                  style="width:18px; height:18px; font-size:18px;"
                  [style.color]="additionalInfo()?.iconColor">
                  {{ additionalInfo()?.icon }}
                </mat-icon>
              }
              <span [style.color]="additionalInfo()?.labelColor">
                {{ additionalInfo()?.label ?? '' | translate }}
              </span>
            </div>
          }
        </div>
      </div>

      <div class="flex justify-center items-center gap-2">
        <span class="text-5xl font-bold">{{ value() }}</span>
        @if(unit()){
          <span class="text-xl">{{ unit() }}</span>
        }
      </div>
    </div>
  }

  <!-- STACKED -->
  @if(variant() === 'stacked'){
    <div class="single-card-stacked w-full h-full rounded-xl p-4 flex flex-col items-center text-center gap-2"
      [style.background-color]="backgroundColor()"
      [style.color]="fontColor()">

      @if(icon()){
        <mat-icon
          style="width:62px; height:62px; font-size:62px;"
          [style.color]="iconColor()">
          {{ icon() }}
        </mat-icon>
      }

      <div class="flex items-end gap-2">
        <span class="text-3xl font-bold">{{ value() }}</span>
        @if(unit()){
          <span class="text-xl">{{ unit() }}</span>
        }
      </div>

      @if(additionalInfo()){
        <div class="flex items-center gap-1 text-md">
          @if(additionalInfo()?.icon){
            <mat-icon
              style="width:18px; height:18px; font-size:18px;"
              [style.color]="additionalInfo()?.iconColor">
              {{ additionalInfo()?.icon }}
            </mat-icon>
          }

          <span [style.color]="additionalInfo()?.labelColor">
            {{ additionalInfo()?.label ?? '' | translate }}
          </span>
        </div>
      }
    </div>
  }

  <!-- INLINE -->
  @if(variant() === 'inline'){
    <div class="single-card-inline w-full h-full rounded-xl p-4 flex items-center justify-between gap-3"
      [style.background-color]="backgroundColor()"
      [style.color]="fontColor()">

      <div class="flex items-center gap-2">
        @if(icon()){
          <mat-icon
            style="width:32px; height:32px; font-size:32px; display: contents;"
            [style.color]="iconColor()">
            {{ icon() }}
          </mat-icon>
        }

        @if(title()){
          <span class="text-md">{{ title() | translate }}</span>
        }
      </div>

      <div class="flex items-end gap-2">
        <span class="text-3xl font-bold">{{ value() }}</span>
        @if(unit()){
          <span class="text-lg">{{ unit() }}</span>
        }
      </div>
    </div>
  }

  <!-- SIDE ICON -->
  @if(variant() === 'side-icon'){
    <div class="single-card-side-icon w-full h-full rounded-xl p-4 flex items-center gap-4"
      [style.background-color]="backgroundColor()"
      [style.color]="fontColor()">

      @if(icon()){
        <div class="flex items-center justify-center">
          <mat-icon
            style="width:62px; height:62px; font-size:62px;"
            [style.color]="iconColor()">
            {{ icon() }}
          </mat-icon>
        </div>
      }

      <div class="flex flex-col gap-1">
        @if(title()){
          <div class="text-xl">{{ title() | translate }}</div>
        }

        @if(additionalInfo()){
          <div class="flex items-center gap-1 text-md">
            @if(additionalInfo()?.icon){
              <mat-icon
                style="width:18px; height:18px; font-size:18px;"
                [style.color]="additionalInfo()?.iconColor">
                {{ additionalInfo()?.icon }}
              </mat-icon>
            }

            <span [style.color]="additionalInfo()?.labelColor">
              {{ additionalInfo()?.label ?? '' | translate }}
            </span>
          </div>
        }

        <div class="flex items-end gap-2">
          <span class="text-2xl font-bold">{{ value() }}</span>
          @if(unit()){
            <span class="text-xl">{{ unit() }}</span>
          }
        </div>
      </div>
    </div>
  }`
})
export class SingleValueComponent {
  title = input<string>('title');

  variant = input<'header' | 'stacked' | 'side-icon' | 'inline'>(SingleValueVariant.HEADER);
  iconColor = input<string>('auto');
  backgroundColor = input<string>('auto');
  unit = input<string>('');
  icon = input.required<string>();
  value = input.required<string | number>();
  additionalInfo = input<SingleValueAdditionalInfo | null>();
  fontColor = input<string | null>(null);
}

enum SingleValueVariant {
  HEADER = 'header',
  STACKED = 'stacked',
  SIDE_ICON = 'side-icon',
  INLINE = 'inline'
}
