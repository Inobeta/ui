import {Component} from '@angular/core';

@Component({
  selector: 'ib-box',
  template: `
    <div fxLayout="column"
         fxFlexFill
         [ngStyle]="{
        'padding': '20px',
        'font-size': '13px',
        'background-color': 'white',
        'min-height': '80px',
        'box-shadow': ' 0px 0px 87px -15px rgba(0,0,0,0.47)'}">
      <ng-content></ng-content>
    </div>
  `,
})
export class BoxComponent {}
