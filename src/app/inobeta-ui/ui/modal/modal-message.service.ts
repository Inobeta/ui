import { Injectable, Type } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { IbModalMessageComponent } from './modal-message.component';
import { IbModalMessage } from './modal-message.model';

@Injectable({providedIn: 'root'})
export class IbModalMessageService {
  constructor(public dialog: MatDialog) { }

  show(data: IbModalMessage, component: Type<any> = IbModalMessageComponent) {

    data.hasYes = (data.hasYes === undefined) ? true : data.hasYes;
    data.hasNo = (data.hasNo === undefined) ? true : data.hasNo;
    data.actions = data.actions || [];

    const dialog = this.dialog.open(component, {
      data
    });

    return dialog.afterClosed();
  }

}
