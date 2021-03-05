import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseParams, IbFormControlBaseComponent } from '../../forms/controls/form-control-base';
import { Component, Input } from '@angular/core';

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
      (input)="onSearchChange($event.target.value, data.base.options)"
      [matAutocomplete]="auto"
      />
      <mat-icon style="cursor:pointer;color:#666;" matSuffix (click)="data.form.controls[data.base.key].reset()">{{'clear'}}</mat-icon>
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="data.base.change(data.self)">
        <mat-option
          *ngFor="let item of autocompleteFiltered"
          [value]="item.value"
          (click)="selectedItem = item"
          >
          {{item.value}}
        </mat-option>
      </mat-autocomplete>
    <mat-error>
      <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
    </mat-error>
  </mat-form-field>
  `
})

export class IbMatAutocompleteComponent implements IbFormControlInterface {
  @Input() data: any;
  autocompleteFiltered = [];
  multiSearchAnd = (text, searchWords) => (
    searchWords.every((el) => {
      return text.match(new RegExp(el, 'i'));
    })
  );
  onSearchChange(input: string, values) {
    this.autocompleteFiltered = values.filter(el =>
      this.multiSearchAnd((el.value).toLowerCase(),
        input.toLowerCase().split('%').filter(e => {
          return e !== '' && e !== ' ';
        }))
    );
  }
}


export class IbMatAutocompleteControl extends IbFormControlBase<string>{
  constructor(options: IbFormControlBaseParams<string>){
    super(options)
    super.control = new IbFormControlBaseComponent(IbMatAutocompleteComponent, {
      base: this
    })
  }
}
