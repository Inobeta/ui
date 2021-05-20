import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-dropdown]',
  template: `
    <mat-form-field appearance="fill" style="width: 100%;"  [formGroup]="data.form">
      <mat-label>{{data.base.label | translate}} {{(data.base.required) ? '*' : ''}}</mat-label>
      <mat-select
        [formControlName]="data.base.key"
        [multiple]="data.base.multiple"
        (selectionChange)="handleSelection($event)"
      >
        <mat-option
          *ngIf="data.base.multiple"
          class="ib-mat-dropdown-select-all"
          (click)="selectAll()"
        >{{ (this.all ? 'shared.ibDropdown.selectNone' : 'shared.ibDropdown.selectAll') | translate}}</mat-option>
        <mat-option *ngIf="data.base.emptyRow" [value]="data.base.emptyRow.key">
          {{data.base.emptyRow.value | translate}}
        </mat-option>
        <mat-option *ngFor="let opt of data.base.options" [value]="opt.key">
          {{opt.value | translate}}
        </mat-option>
      </mat-select>
      <mat-icon
        matSuffix
        *ngIf="hintMessage"
        [matTooltip]="hintMessage | translate"
      >
          help_outline
      </mat-icon>
      <mat-error>
        <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
      </mat-error>
    </mat-form-field>


    <!-- TODO: example style with inline search
https://stackblitz.com/edit/angular-ev8r2t?file=src%2Fapp%2Fselect-multiple-example.html
      <mat-option class="select-all">
        <input type="text" matInput (click)="$event.stopPropagation()"/>
      </mat-option>
      <mat-option class="select-all" (click)="selectAll()">{{ this.all ? 'none' : 'all'}}</mat-option>
      <div style="overflow:auto;height:160px;">
      <mat-option *ngFor="let t of toppingList" [value]="t.key">{{t.value}}</mat-option>
      </div>
-->
  `,
  styles: [`
      .ib-mat-dropdown-select-all >>> mat-pseudo-checkbox {
        display: none;
      }
  `]
})

export class IbMatDropdownComponent implements IbFormControlInterface {
  @Input() data: IbDropdownData;
  all = false;
  get hintMessage() {
    return (this.data.base.hintMessage) ? this.data.base.hintMessage() : null;
  }

  selectAll() {
    let newValues: any = [];
    this.all = !this.all;
    if (this.all) {
      newValues = this.data.base.options.map(t => t.key);
    }
    this.data.self.setValue(newValues);
    this.data.base.change(this.data.self);
  }



  handleSelection(who) {
    if (this.data.base.multiple) {
      if (who.value[0] === undefined) { return; }
      const currentValue = this.data.self.value;
      this.all = currentValue && currentValue.length === this.data.base.options.length;
    }

    this.data.base.change(this.data.self);
  }

}


export class IbMatDropdownControl extends IbFormControlBase<string | string[] | number | number[]> {
  multiple = false;
  emptyRow = null;
  hintMessage;
  constructor(options: IbMatDropdownParams) {
    super(options);
    this.multiple = options.multiple || false;
    this.emptyRow = options.emptyRow || null;
    this.hintMessage = options.hintMessage || null;
    this.control = new IbFormControlBaseComponent(IbMatDropdownComponent, {
      base: this
    });
  }
}



export interface IbMatDropdownParams extends IbFormControlBaseParams<string | string[] | number | number[]> {
  multiple?: boolean;
  emptyRow?: {key?: string | number, value: string};
  hintMessage?: () => string;
}


export interface IbDropdownData extends IbFormControlData {
  base: IbMatDropdownParams;
}
