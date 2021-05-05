import { Component, Input } from '@angular/core';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-textbox]',
  template: `
  <mat-form-field appearance="fill" style="width: 100%;" [formGroup]="data.form">
    <mat-label>{{data.base.label | translate}} {{(data.base.required) ? '*' : ''}}</mat-label>
    <!--
      https://github.com/angular/angular/issues/13243
      type is not dynamic (see angular issue)
    -->
    <input
      matInput
      *ngIf="data.base.type === 'number'"
      [formControlName]="data.base.key"
      [id]="data.base.key"
      type="number"
      (keyup)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
    />
    <input
      matInput
      *ngIf="data.base.type === 'text'"
      [formControlName]="data.base.key"
      [id]="data.base.key"
      type="text"
      (keyup)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
    />
    <input
      matInput
      *ngIf="data.base.type === 'email'"
      [formControlName]="data.base.key"
      [id]="data.base.key"
      type="email"
      (keyup)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
    />
    <input
      matInput
      *ngIf="data.base.type === 'password'"
      [formControlName]="data.base.key"
      [id]="data.base.key"
      type="password"
      (keyup)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
    />
    <input
      matInput
      *ngIf="data.base.type === 'date'"
      [formControlName]="data.base.key"
      [id]="data.base.key"
      type="date"
      (keyup)="data.base.change(data.self)"
      (change)="data.base.change(data.self)"
    />
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
  `
})

export class IbMatTextboxComponent implements IbFormControlInterface {
  @Input() data: IbMatTextboxData;
  get hintMessage() {
    return (this.data.base.hintMessage) ? this.data.base.hintMessage() : null;
  }
}


export class IbMatTextboxControl extends IbFormControlBase<number | string> {
  hintMessage;

  constructor(options: IbMatTextboxParams) {
    options.type = options.type || 'text';
    super(options);
    this.hintMessage = options.hintMessage || null;
    this.control = new IbFormControlBaseComponent(IbMatTextboxComponent, {
      base: this
    });
  }
}


export interface IbMatTextboxParams extends IbFormControlBaseParams<number | string> {
  hintMessage?: () => string;
}

export interface IbMatTextboxData extends IbFormControlData {
    base: IbMatTextboxParams;
}

