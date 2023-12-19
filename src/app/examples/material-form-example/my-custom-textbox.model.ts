import { IbFormControlBase, IbFormControlBaseParams, IbFormControlInterface, IbFormControlBaseComponent } from 'src/app/inobeta-ui/ui/forms';
import { Component, Input } from '@angular/core';

@Component({
  selector: '[ib-my-custom-textbox]',
  template: `
  <mat-form-field appearance="fill" style="width: 100%;" [formGroup]="data.form">
    <mat-label>{{data.base.label | translate}} {{data.base.testField}}</mat-label>
    <input
      matInput
      [formControlName]="data.base.key"
      [id]="data.base.key"
      [type]="data.base.type"
      (keyup)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
    />
    <mat-icon style="cursor:pointer;color:#666;" matSuffix (click)="data.form.controls[data.base.key].reset()">{{'clear'}}</mat-icon>
    <mat-error>
      <ng-container *ngTemplateOutlet="data.formControlErrors;context: this"></ng-container>
    </mat-error>
  </mat-form-field>
  `
})

export class MyCustomTextboxComponent implements IbFormControlInterface {
  @Input() data: any;
}


export class MyCustomTextbox extends IbFormControlBase<string>{
  testField = 'Questa è una prova';
  constructor(options: MyCustomTextboxParams){
    super(options)
    this.testField = options.testField;
    this.control = new IbFormControlBaseComponent(MyCustomTextboxComponent, {
      base: this
    })
  }
}

export interface MyCustomTextboxParams extends IbFormControlBaseParams<string> {
  testField: string;
}


