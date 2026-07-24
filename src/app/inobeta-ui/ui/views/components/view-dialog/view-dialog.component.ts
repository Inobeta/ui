import { Component, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface IbTableViewDialogData {
  title: string;
  message?: {
    label: string;
    args?: unknown;
  };
  confirm: string;
  color?: string;

  /** Pre-filled view name for rename/duplicate flows. */
  viewName?: string;
  /** When `true`, hides the name input and shows the message text instead. */
  hideInput?: boolean;

  /** When `true`, hides the Cancel button (legacy binary-save mode). */
  hideCancel?: boolean;
  /**
   * When `true`, shows an additional "No" (Don't Save) button.
   * Mutually exclusive with {@link discardLabel}.
   */
  hasNo?: boolean;
  /**
   * If provided, enables three-button Discard / Cancel / Confirm mode.
   * The value is the translation key for the Discard button label.
   *
   * When set, `hideCancel` is ignored (Cancel is always shown) and
   * `hasNo` is ignored.  The dialog emits a typed result compatible
   * with {@link import("../view.types").IbViewDialogOutput | IbViewDialogOutput}.
   */
  discardLabel?: string;
}

@Component({
  selector: "ib-table-view-dialog",
  template: `
    <h2 mat-dialog-title>{{ data?.title | translate }}</h2>

    <mat-dialog-content>
      <div style="display: flex; flex-direction: column;padding:5px;">
      @if (data?.hideInput) {
        <p
          translate
          [translateParams]="data?.message?.args"
          >
          {{ data?.message?.label }}
        </p>
      }

      @if (!data?.hideInput) {
        <mat-form-field style="width: 100%;">
          <mat-label>{{ "shared.ibTableView.viewName" | translate }}</mat-label>
          <input [formControl]="viewName" matInput maxlength="40" />
          <mat-hint align="end">{{ viewName.value?.length ?? 0 }}/40</mat-hint>
          @if (viewName.hasError('required') && viewName.touched) {
            <mat-error>{{ "shared.ibTableView.nameRequired" | translate }}</mat-error>
          }
        </mat-form-field>
      }
      </div>
    </mat-dialog-content>

    <div mat-dialog-actions style="justify-content: flex-end">
      @if (data?.discardLabel) {
        <!-- Three-button Discard / Cancel / Confirm mode -->
        <button mat-button [mat-dialog-close]="{
          action: 'discard',
          name: viewName.value
        }">
          {{ data.discardLabel | translate }}
        </button>
        <button mat-button mat-dialog-close>
          {{ "shared.ibTableView.cancel" | translate }}
        </button>
        <button
          mat-button
          [disabled]="!data?.hideInput ? viewName.invalid : false"
          [color]="data?.color ?? 'primary'"
          [mat-dialog-close]="{
            action: 'save',
            name: viewName.value
          }"
          >
          {{ data?.confirm | translate }}
        </button>
      } @else {
        <!-- Legacy binary mode -->
        @if (!data?.hideCancel) {
          <button mat-button mat-dialog-close>
            {{ "shared.ibTableView.cancel" | translate }}
          </button>
        }
        @if (data?.hasNo) {
          <button mat-button [mat-dialog-close]="{
            confirmed: false
          }">{{ "shared.ibTableView.no" | translate }}</button>
        }
        <button
          mat-button
          [disabled]="!data?.hideInput ? viewName.invalid : false"
          [color]="data?.color ?? 'primary'"
          [mat-dialog-close]="{
            name: viewName.value,
            confirmed: true
          }"
          >
          {{ data?.confirm | translate }}
        </button>
      }
    </div>
    `,
  standalone: false
})
export class IbTableViewDialog {
  viewName = new FormControl("", { validators: [Validators.required] });

  constructor(@Inject(MAT_DIALOG_DATA) public data: IbTableViewDialogData) {
    if (data?.viewName) {
      this.viewName.setValue(data.viewName.substring(0, 40));
    }
  }
}
