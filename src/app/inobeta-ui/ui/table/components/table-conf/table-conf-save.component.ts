import {Component, Inject, ViewChild} from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { IbFormControlBase } from '../../../forms';
import { IbMatCheckboxControl, IbMaterialFormComponent, IbMatRadioControl, IbMatTextboxControl } from '../../../material-forms';
import { IbTableConfService } from '../../services/table-conf.service';
import { ibTableCurrentConfSelector } from '../../store/selectors/table.selectors';

@Component({
  selector: 'ib-table-conf-save',
  template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <mat-dialog-content style="min-width:350px;min-height: 10vh;">
      <div>{{ data.message | translate }}</div>
      <ib-material-form
        #saveConfForm
        [fields]="fields"
        rowHeight="85px"
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
        [disabled]="!saveConfForm.form.valid"
        [mat-dialog-close]="{data: saveConfForm.form.getRawValue(), selectedConfig: selectedConfig}">
        {{ 'shared.ibModal.yes' | translate }}
      </button>
    </mat-dialog-actions>`,
})
export class IbTableConfSaveComponent {
  fields: IbFormControlBase<any>[] = [];
  selectedConfig: string;
  @ViewChild('saveConfForm', {static: true}) saveConfForm: IbMaterialFormComponent;


  constructor(
    public dialogRef: MatDialogRef<IbTableConfSaveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tableConf: IbTableConfService,
    private store: Store<any>,
    private translate: TranslateService
    ) {
      this.store.select(ibTableCurrentConfSelector).pipe(take(1)).subscribe((selectedConfig = '') => {
        this.selectedConfig = '';
        const options = [{ key: 'new', value: 'shared.ibTable.saveConf.newConf'}];
        let value = 'new';
        const [table, configName] = selectedConfig.split('/') || [null, null];
        if (selectedConfig.startsWith(this.data.tableName)){
          options.push({ key: 'edit', value: `${this.translate.instant('shared.ibTable.saveConf.editConf')} (${configName})`});
          value = 'edit';
          this.selectedConfig = configName;
        }
        this.fields = [
          new IbMatRadioControl({
            key: 'selector',
            options, value,
            width: '100%',
            change: (control) => {
              control?.parent?.controls['name'].markAsTouched();
              control?.parent?.controls['name'].updateValueAndValidity();
              if(control?.value === 'new'){
                control?.parent?.controls['name'].setValue('');
              }
              if(control?.value === 'edit'){
                control?.parent?.controls['name'].setValue(this.selectedConfig);
              }
            }
          }),
          new IbMatCheckboxControl({key: 'default', label: 'shared.ibTable.saveConf.setAsDefault', value: true, width: '30%',}),
          new IbMatTextboxControl({
            key: 'name',
            width: '70%',
            value: this.selectedConfig || '',
            label: 'shared.ibTable.saveConf.configName',
            required: true,
            validators: [this.checkConfigExists()]
          })
        ];
      });
    }



    checkConfigExists(): ValidatorFn {
      return (control: AbstractControl): {[key: string]: any} | null => {
       if (this.saveConfForm?.form?.getRawValue().selector === 'new'
              && control.value
              && this.tableConf.loadConfig(this.data.tableName, control.value)
              ) {
          return {
            customError: {
              message: 'shared.ibTable.saveConf.configExists'
            }
          };
        }
      };
    }
}
