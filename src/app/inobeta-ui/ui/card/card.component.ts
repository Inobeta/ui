import {Component} from '@angular/core';

@Component({
  selector: 'ib-card',
  template: `
    <div fxLayout="column"
         fxFill
         [ngStyle]="{
        'padding': '20px',
        'padding-top': '20px',
        'padding-right': '55px',
        'padding-left': '55px',
        'font-size': '13px',
        'min-height': '200px',
        'background-color': 'white',
        'box-shadow': ' 0px 0px 87px -15px rgba(0,0,0,0.47)'}">
      <ng-content></ng-content>
    </div>
  `,
})
export class CardComponent {}
