import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IbTableConfService } from '../../services/table-conf.service';

@Component({
  selector: 'ib-table-conf-save',
  template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <mat-dialog-content style="min-width:350px;min-height: 10vh;">
      <div>{{ data.message | translate:{tableName: data.tableName} }}</div>
      <mat-list>
        <mat-list-item *ngFor="let config of configs">
          <div mat-line>
            <button (click)="toggleDefault(config)" mat-icon-button>
              <mat-icon *ngIf="config.isDefault; else notDefault">star</mat-icon>
              <ng-template #notDefault><mat-icon>star_outline</mat-icon></ng-template>
            </button>
            {{config.name}}
          </div>
          <div>
            <button (click)="loadConfig(config)" color="accent" mat-icon-button>
              <mat-icon>upload</mat-icon>
            </button>
            <button (click)="deleteConfig(config)" color="warn" mat-icon-button>
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        </mat-list-item>
      </mat-list>
    </mat-dialog-content>
    <!--mat-dialog-actions align="end">
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
    </mat-dialog-actions -->
    `,
})
export class IbTableConfLoadComponent {
  configs;

  constructor(
    public dialogRef: MatDialogRef<IbTableConfLoadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private tableConf: IbTableConfService,
    private store: Store<any>,
  ) {
    const [error, _, configs] = this.tableConf.getConfigsByTableName(this.data.tableName);
    if (error) {
      return;
    }
    this.mapConfigs(configs);
  }

  mapConfigs(configs) {
    this.configs = Object.entries<any>(configs)
      .map(([name, config]) => ({ name, isDefault: config?.default }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  loadConfig(config) {
    this.dialogRef.close(config);
  }

  deleteConfig(config) {
    const [error, configs] = this.tableConf.deleteConfig(this.data.tableName, config.name);
    if (error) {
      return;
    }
    this.mapConfigs(configs);
  }

  toggleDefault(config) {
    const [error, configs] = this.tableConf.toggleDefault(this.data.tableName, config.name);
    if (error) {
      return;
    }
    this.mapConfigs(configs);
  }
}
