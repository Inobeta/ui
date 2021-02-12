import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component ({
  selector: 'ib-uploader',
  template: `
    <div fxFlex fxLayout="column" fxLayoutAlign="center center">
      <input (change)="onChooseChange()" #uploader class="hidden" type="file"/>
      <button fxFlex mat-button (click)="onChooseClick()" >{{textKey | translate}}</button>
    </div>
  `
})
export class UploaderComponent {
  @ViewChild('uploader', {static: false}) uploader !: ElementRef;
  @Input() textKey: string;
  @Output() onFileSelected: EventEmitter<any> = new EventEmitter<any>();

  constructor() {}

  onChooseClick() {
    this.uploader.nativeElement.click();
  }

  onChooseChange() {
    if (this.uploader.nativeElement.files && this.uploader.nativeElement.files.length > 0) {
      this.onFileSelected.emit(this.uploader.nativeElement.files[0]);
    }
  }
}
