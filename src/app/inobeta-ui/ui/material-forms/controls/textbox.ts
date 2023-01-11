import { Component, Input } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { IbFormControlInterface, IbFormControlBase, IbFormControlBaseComponent, IbFormControlBaseParams, IbFormControlData } from '../../forms/controls/form-control-base';

@Component({
  selector: '[ib-mat-textbox]',
  template: `
  <mat-form-field appearance="fill" style="width: 100%;" [formGroup]="data.form">
    <mat-label>{{data.base.label | translate}}</mat-label>
    <!--
      https://github.com/angular/angular/issues/13243
      type is not dynamic (see angular issue)
    -->
    <input
      matInput
      *ngIf="data.base.type === 'number'"
      [formControlName]="data.base.key"
      [id]="data.base.key"
      [min]="minValidator"
      [max]="maxValidator"
      type="number"
      (keyup)="data.base.change(data.self)"
      (input)="data.base.change(data.self)"
    />
    <input
      matInput
      *ngIf="data.base.type === 'text'"
      [formControlName]="data.base.key"
      [id]="data.base.key"
      [maxlength]="maxLengthValidator"
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

  get minValidator() {
    for (const func of this.data.base.validators) {
      const validation = func({value: -Infinity} as AbstractControl);
      if (validation && validation.min) {
        return validation.min.min;
      }
    }
    return null;
  }

  get maxValidator() {
    for (const func of this.data.base.validators) {
      const validation = func({value: Infinity} as AbstractControl);
      if (validation && validation.max) {
        return validation.max.max;
      }
    }
    return null;
  }


  get maxLengthValidator() {
    for (const func of this.data.base.validators) {
      const getMethods = (obj) => {
        let properties = new Set()
        let currentObj = obj
        do {
          Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
        } while ((currentObj = Object.getPrototypeOf(currentObj)))
        return [...properties.keys()].filter((item: any) => typeof obj[item] === 'function') as string[]
      }
      const sampleString = this.data.self.value
      if(!sampleString) return Infinity

      const methods: string[] = getMethods(sampleString)
      const fakeString: any = {}
      for(let m of methods){
        fakeString[m] = sampleString[m].bind(sampleString)
      }
      fakeString['length'] = Infinity
      const validation = func({value: fakeString} as AbstractControl);
      if (validation && validation.maxlength) {
        return validation.maxlength.requiredLength;
      }
    }
    return Infinity;
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

