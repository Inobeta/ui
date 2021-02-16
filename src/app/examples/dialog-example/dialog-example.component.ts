import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ModalMessageComponent } from 'src/app/inobeta-ui/modules/ui/modal';

@Component({
  selector: 'ib-dialog-example',
  template: `
  <button (click)="open()">open dialog</button>
  <div>{{ response }}</div>
  `
})

export class DialogExampleComponent implements OnInit {

  response = ''

  constructor(public dialog: MatDialog) { }

  ngOnInit() { }


  open(){
    const dialog = this.dialog.open(ModalMessageComponent, {
      data: {
        title: 'Titolo',
        message: 'Messaggio',
        hasYes: true,
        hasNo: true
      }
    });

    dialog.afterClosed().subscribe(result => {
      this.response = `Clicked on ${result}`
    });
  }
}
