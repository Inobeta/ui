import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { SingleValueAdditionalInfo } from './types';
import { TranslateModule } from '@ngx-translate/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'single-value',
  standalone: true,
  imports: [TranslateModule, MatIconModule, DecimalPipe],
  template: `
  @if(variant() === 'header'){
  <div
    class="single-value single-value--header"
    [style.background-color]="backgroundColor()"
    [style.color]="fontColor()">

    <div class="single-value__header-row">
      @if(icon()){
        <div class="single-value__icon-container">
          <mat-icon
            class="single-value__icon single-value__icon--header"
            [style.color]="iconColor()">
            {{ icon() }}
          </mat-icon>
        </div>
      }

      <div class="single-value__header-text">
        <div class="single-value__title single-value__title--xl">{{ title() | translate }}</div>

        @if(additionalInfo()){
          <div class="single-value__additional-info single-value__additional-info--md">
            @if(additionalInfo()?.icon){
              <mat-icon
                class="single-value__additional-icon"
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

    <div class="single-value__value-row single-value__value-row--center">
      <span class="single-value__value single-value__value--5xl">{{ value() | number:digitsInfo():locale() }}</span>
      @if(unit()){
        <span class="single-value__unit single-value__unit--xl">{{ unit() }}</span>
      }
    </div>
  </div>
}

@if(variant() === 'stacked'){
  <div
    class="single-value single-value--stacked"
    [style.background-color]="backgroundColor()"
    [style.color]="fontColor()">

    @if(icon()){
      <mat-icon
        class="single-value__icon single-value__icon--stacked"
        [style.color]="iconColor()">
        {{ icon() }}
      </mat-icon>
    }

    <div class="single-value__value-row single-value__value-row--end">
      <span class="single-value__value single-value__value--3xl">{{ value() | number:digitsInfo():locale() }}</span>
      @if(unit()){
        <span class="single-value__unit single-value__unit--xl">{{ unit() }}</span>
      }
    </div>

    @if(additionalInfo()){
      <div class="single-value__additional-info single-value__additional-info--md">
        @if(additionalInfo()?.icon){
          <mat-icon
            class="single-value__additional-icon"
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

@if(variant() === 'inline'){
  <div
    class="single-value single-value--inline"
    [style.background-color]="backgroundColor()"
    [style.color]="fontColor()">

    <div class="single-value__inline-start">
      @if(icon()){
        <mat-icon
          class="single-value__icon single-value__icon--inline"
          [style.color]="iconColor()">
          {{ icon() }}
        </mat-icon>
      }

      @if(title()){
        <span class="single-value__title single-value__title--md">{{ title() | translate }}</span>
      }
    </div>

    <div class="single-value__value-row single-value__value-row--end">
      <span class="single-value__value single-value__value--3xl">{{ value() | number:digitsInfo():locale() }}</span>
      @if(unit()){
        <span class="single-value__unit single-value__unit--lg">{{ unit() }}</span>
      }
    </div>
  </div>
}

@if(variant() === 'side-icon'){
  <div
    class="single-value single-value--side-icon"
    [style.background-color]="backgroundColor()"
    [style.color]="fontColor()">

    @if(icon()){
      <div class="single-value__icon-container">
        <mat-icon
          class="single-value__icon single-value__icon--stacked"
          [style.color]="iconColor()">
          {{ icon() }}
        </mat-icon>
      </div>
    }

    <div class="single-value__side-content">
      @if(title()){
        <div class="single-value__title single-value__title--xl">{{ title() | translate }}</div>
      }

      @if(additionalInfo()){
        <div class="single-value__additional-info single-value__additional-info--md">
          @if(additionalInfo()?.icon){
            <mat-icon
              class="single-value__additional-icon"
              [style.color]="additionalInfo()?.iconColor">
              {{ additionalInfo()?.icon }}
            </mat-icon>
          }

          <span [style.color]="additionalInfo()?.labelColor">
            {{ additionalInfo()?.label ?? '' | translate }}
          </span>
        </div>
      }

      <div class="single-value__value-row single-value__value-row--end">
        <span class="single-value__value single-value__value--2xl">{{ value() | number:digitsInfo():locale() }}</span>
        @if(unit()){
          <span class="single-value__unit single-value__unit--xl">{{ unit() }}</span>
        }
      </div>
    </div>
  </div>
  }`,
  styleUrls: ['./single-value.component.scss']
})
export class SingleValueComponent {
  title = input<string>('title');

  variant = input<'header' | 'stacked' | 'side-icon' | 'inline'>(SingleValueVariant.HEADER);
  iconColor = input<string>('auto');
  backgroundColor = input<string>('auto');
  unit = input<string>('');
  digitsInfo = input<string>('1.2-2');
  icon = input.required<string>();
  value = input.required<number>();
  additionalInfo = input<SingleValueAdditionalInfo | null>();
  fontColor = input<string | null>(null);
  locale = input<string>('it');
}

enum SingleValueVariant {
  HEADER = 'header',
  STACKED = 'stacked',
  SIDE_ICON = 'side-icon',
  INLINE = 'inline'
}
