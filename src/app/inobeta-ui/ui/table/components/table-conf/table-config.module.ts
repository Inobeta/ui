import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { IbTableConfService } from '../../services/table-conf.service';
import { IbTableConfLoadComponent } from './table-conf-load.component';
import { IbTableConfSaveComponent } from './table-conf-save.component';
import { IbMaterialFormModule } from '../../../material-forms/material-form.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    IbTableConfSaveComponent,
    IbTableConfLoadComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatListModule,
    MatDialogModule,
    MatIconModule,
    TranslateModule.forChild({
      extend: true
    }),
    IbMaterialFormModule
  ],
  exports: [
    IbTableConfSaveComponent,
    IbTableConfLoadComponent
  ],
  providers: [
    IbTableConfService
  ]
})
export class IbTableConfigModule { }
