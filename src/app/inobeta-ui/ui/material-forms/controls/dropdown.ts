import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-dropdown]',
  template: `
    <mat-form-field appearance="fill" style="width: 100%;"  [formGroup]="data.form">
      <mat-label>{{data.base.label | translate}}</mat-label>
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
        <mat-option *ngFor="let opt of data.base.options" [value]="opt.key">
          {{opt.value | translate}}
        </mat-option>
      </mat-select>
      <mat-error>
        <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
      </mat-error>
    </mat-form-field>
  `,
  styles: [`
      .ib-mat-dropdown-select-all >>> mat-pseudo-checkbox {
        display: none;
      }
  `]
})

export class IbMatDropdownComponent implements IbFormControlInterface {
  @Input() data: any;
  all = false;
  selectAll() {
    let newValues: any = [];
    this.all = !this.all;
    if (this.all) {
      newValues = this.data.base.options.map(t => t.key);
    }
    this.data.self.setValue(newValues);
    this.data.base.change(this.data.self)
  }



  handleSelection(who) {
    if(this.data.base.multiple){
      if (who.value[0] === undefined) return;
      const currentValue = this.data.self.value;
      this.all = currentValue && currentValue.length === this.data.base.options.length;
    }

    this.data.base.change(this.data.self)
  }

}


export class IbMatDropdownControl extends IbFormControlBase<string>{
  multiple = false;
  constructor(options: IbMatDropdownParams){
    super(options)
    this.multiple = options.multiple || false;
    this.control = new IbFormControlBaseComponent(IbMatDropdownComponent, {
      base: this
    })
  }
}



export interface IbMatDropdownParams extends IbFormControlBaseParams<string>{
  multiple?: boolean;
}

