import { Injectable, Type } from '@angular/core';
import { MatDialog } from '@angular/material';
import { IbModalMessageComponent } from './modal-message.component';

@Injectable()
export class IbModalMessageService {
  constructor(public dialog: MatDialog) { }

  show(data:IbModalMessage, component: Type<any> = IbModalMessageComponent){

    data.hasYes = (data.hasYes === undefined) ? true : data.hasYes;
    data.hasNo = (data.hasNo === undefined) ? true : data.hasNo;

    const dialog = this.dialog.open(component, {
      data: data
    });

    return dialog.afterClosed();
  }

}

export interface IbModalMessage{
  title: string;
  message: string;
  hasYes?: boolean;
  hasNo?: boolean;
}
