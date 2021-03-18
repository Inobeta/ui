import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ib-table-button',
  template: `
    <div fxLayout="row" fxLayout="space-around center">
    <button
      (click)="click.emit(); $event.stopPropagation();"
      [type]="'button'"
      mat-raised-button
      [color]="color"
    >{{ label  | translate}}</button>
  </div>
  `
})

export class IbTableButtonComponent implements OnInit {
  @Input() label = '';
  @Input() color = 'primary'
  @Output() click: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() { }
}
