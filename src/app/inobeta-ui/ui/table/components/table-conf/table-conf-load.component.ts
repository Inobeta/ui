import { Component, Inject, ViewChild } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IbFormControlBase } from '../../../forms';
import { IbMaterialFormComponent, IbMatAutocompleteControl } from '../../../material-forms';
import { IbTableConfService } from '../../services/table-conf.service';

@Component({
  selector: 'ib-table-conf-save',
  template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <mat-dialog-content style="min-width:350px;min-height: 10vh;">
      <div>{{ data.message | translate:{tableName: data.tableName} }}</div>
      <ib-material-form
        #loadConfForm
        [fields]="fields"
        rowHeight="85px"
        (ibSubmit)="handleSubmit()"
      ></ib-material-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        *ngFor="let btn of data.actions"
        mat-raised-button
        [color]="btn.color || 'basic'"
        [mat-dialog-close]="btn.value">
        {{ btn.label | translate }}
      </button>
      <button
        *ngIf="data.hasNo"
        mat-raised-button
        [mat-dialog-close]="false">
        {{ 'shared.ibModal.no' | translate }}
      </button>
      <button
        *ngIf="data.hasYes"
        mat-raised-button
        color="primary"
        [disabled]="!loadConfForm.form.valid"
        [mat-dialog-close]="handleSubmit()">
        {{ 'shared.ibModal.yes' | translate }}
      </button>
    </mat-dialog-actions>`,
})
export class IbTableConfLoadComponent {
  fields: IbFormControlBase<any>[] = [];
  @ViewChild('loadConfForm', { static: true }) loadConfForm: IbMaterialFormComponent;

  constructor(
    public dialogRef: MatDialogRef<IbTableConfLoadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tableConf: IbTableConfService,
    private store: Store<any>,
    // private translate: TranslateService
  ) {
    const configs = this.tableConf.getConfigsByTableName(this.data.tableName);
    if (!configs) {
      return;
    }
    const options = configs.map(c => ({value: c}))
    this.fields = [
      new IbMatAutocompleteControl({
        key: 'config',
        options: options,
        width: '100%',
        label: 'shared.ibTable.saveConf.configName',
        required: true,
        validators: [this.forceConfigName(configs)]
      })
    ]
  }

  forceConfigName(configs: string[]): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      if (!configs.includes(control.value)) {
         return {
           customError: {
             message: 'shared.ibTable.loadConf.noConfig'
           }
         };
       }
     };
  }

  handleSubmit() {
    return this.loadConfForm.form.getRawValue();
  }
}
