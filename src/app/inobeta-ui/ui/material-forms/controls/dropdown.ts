import { Component, Input } from "@angular/core";
import { MatSelectChange } from "@angular/material/select";
import {
  IbFormControlBase,
  IbFormControlBaseComponent,
  IbFormControlBaseParams,
  IbFormControlData,
  IbFormControlInterface,
} from "../../forms/controls/form-control-base";

@Component({
  selector: "[ib-mat-dropdown]",
  template: `
    <mat-form-field
      appearance="fill"
      style="width: 100%;"
      [formGroup]="data.form"
    >
      <mat-label>{{ data.base.label | translate }}</mat-label>
      <mat-select
        [formControlName]="data.base.key"
        [multiple]="data.base.multiple"
        (selectionChange)="handleSelection($event)"
      >
        <mat-option
          *ngIf="data.base.multiple"
          class="ib-mat-dropdown-select-all"
          value="__all"
          >{{
            (this.all
              ? "shared.ibDropdown.selectNone"
              : "shared.ibDropdown.selectAll"
            ) | translate
          }}</mat-option
        >
        <mat-option *ngIf="data.base.emptyRow" [value]="data.base.emptyRow.key">
          {{ data.base.emptyRow.value | translate }}
        </mat-option>
        <mat-option *ngFor="let opt of data.base.options" [value]="opt.key">
          {{ opt.value | translate }}
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
        <ng-container
          *ngTemplateOutlet="data.formControlErrors; context: this"
        ></ng-container>
      </mat-error>
    </mat-form-field>
  `,
  styles: [
    `
      .ib-mat-dropdown-select-all ::ng-deep mat-pseudo-checkbox {
        display: none;
      }
    `,
  ],
})
export class IbMatDropdownComponent implements IbFormControlInterface {
  @Input() data: IbDropdownData;
  all = false;
  get hintMessage() {
    return this.data.base.hintMessage ? this.data.base.hintMessage() : null;
  }

  selectAll() {
    this.all = !this.all;
    if (this.all) {
      const newValues = this.data.base.options.map((t) => t.key);
      this.data.self.setValue(newValues);
    } else {
      this.data.self.setValue([]);
    }
    this.data.base.change(this.data.self);
  }

  handleSelection(option: MatSelectChange) {
    if (this.data.base.multiple) {
      if (option.value.includes("__all")) {
        this.selectAll();
      }
      const currentValue = this.data.self.value.filter((t) => t !== "__all");
      this.all =
        currentValue && currentValue.length === this.data.base.options.length;
    }

    this.data.base.change(this.data.self);
  }
}

/** @deprecated */
export class IbMatDropdownControl extends IbFormControlBase<
  string | string[] | number | number[]
> {
  multiple = false;
  emptyRow = null;
  hintMessage;
  constructor(options: IbMatDropdownParams) {
    super(options);
    this.multiple = options.multiple || false;
    this.emptyRow = options.emptyRow || null;
    this.hintMessage = options.hintMessage || null;
    this.control = new IbFormControlBaseComponent(IbMatDropdownComponent, {
      base: this,
    });
  }
}

export interface IbMatDropdownParams
  extends IbFormControlBaseParams<string | string[] | number | number[]> {
  multiple?: boolean;
  emptyRow?: { key?: string | number; value: string };
  hintMessage?: () => string;
}

export interface IbDropdownData extends IbFormControlData {
  base: IbMatDropdownParams;
}
