import { Component, OnInit } from '@angular/core';
import { IbModalMessageService } from 'src/app/inobeta-ui/ui/modal/modal-message.service';

@Component({
  selector: 'ib-dialog-example',
  template: `
  <button (click)="open()">open dialog</button>
  <div>{{ response }}</div>
  `
})

export class DialogExampleComponent implements OnInit {

  response = '';

  constructor(public dialog: IbModalMessageService) { }

  ngOnInit() { }


  open() {
    this.dialog.show( {
        title: 'Titolo',
        message: 'Messaggio',
        actions: [
          { label: 'Accent action', value: 'abc', color: 'accent'},
          { label: 'Basic action', value: 'basic'}
        ],
        minWidth: '500px',
        minHeight: '50vh'
    }).subscribe(result => {
      this.response = `Clicked on ${result}`;
    });
  }
}
