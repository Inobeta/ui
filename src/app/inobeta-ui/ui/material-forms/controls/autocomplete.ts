import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseParams,
  IbFormControlBaseComponent, IbFormControlData } from '../../forms/controls/form-control-base';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

/** @deprecated */
@Component({
    selector: '[ib-mat-autocomplete]',
    template: `
  <mat-form-field appearance="fill" style="width: 100%;" [formGroup]="data.form">
    <mat-label>{{data.base.label | translate}}</mat-label>
    <input
      matInput
      type="text"
      [formControlName]="data.base.key"
      #searchBox
      (keyup)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
       (input)="onSearchInput($event)"
       (focus)="onSearchInput($event)"
      [matAutocomplete]="auto"
      />
    <mat-icon
      style="cursor:pointer;color:#666;"
      matSuffix
      (click)="data.self.reset(); data.base.change(data.self)"
    >{{'clear'}}</mat-icon>
    <mat-autocomplete #auto="matAutocomplete" (optionSelected)="data.base.change(data.self)">
      @for (item of autocompleteFiltered; track item) {
        <mat-option
          [value]="item.value"
          (click)="selectedItem = item"
          >
          {{item.value}}
        </mat-option>
      }
    </mat-autocomplete>
    <mat-error>
      <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
    </mat-error>
  </mat-form-field>
  `,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})

export class IbMatAutocompleteComponent implements IbFormControlInterface {
  @Input() data: IbFormControlData;
  autocompleteFiltered: { key?: string | number; value: string }[] = [];
  selectedItem: { key?: string | number; value: string } | undefined;
  multiSearchAnd = (text: string, searchWords: string[]) => (
    searchWords.every((el: string) => {
      return text.match(new RegExp(el, 'i'));
    })
  )
  onSearchInput(event: Event) {
    const input = (event.target as HTMLInputElement | null)?.value ?? '';
    this.onSearchChange(input, this.data.base.options);
  }
  onSearchChange(input: string, values: { key?: string | number; value: string }[]) {
    this.autocompleteFiltered = values.filter((el) =>
      this.multiSearchAnd((el.value).toLowerCase(),
        input.toLowerCase().split('%').filter((entry) => {
          return entry !== '' && entry !== ' ';
        }))
    );
  }
}

/** @deprecated */
export class IbMatAutocompleteControl extends IbFormControlBase<string> {
  constructor(options: IbFormControlBaseParams<string>) {
    super(options);
    this.control = new IbFormControlBaseComponent(IbMatAutocompleteComponent, {
      base: this
    });
  }
}
