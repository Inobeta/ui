import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { IbTableConfService } from '../../services/table-conf.service';
import { IbTableConfLoadComponent } from './table-conf-load.component';
import { IbTableConfSaveComponent } from './table-conf-save.component';
import { IbMaterialFormModule } from '../../../material-forms/material-form.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
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

/**
* @deprecated Use IbKaiTableModule
*/
export class IbTableConfigModule { }
