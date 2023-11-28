import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';


/**
* @deprecated Use IbKaiTableModule
*/
@Component({
  selector: 'ib-table-button',
  template: `
    <div fxLayout="row" fxLayout="space-around center">
    <button
      (click)="click.emit(); $event.stopPropagation();"
      [type]="'button'"
      mat-raised-button
      [color]="color"
      [disabled]="disabled"
    >{{ label  | translate}}</button>
  </div>
  `
})

export class IbTableButtonComponent implements OnInit {
  @Input() label = '';
  @Input() color = 'primary'
  @Input() disabled = false
  @Output() click: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit() { }
}
