import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';

@Component ({
  selector: 'ib-uploader',
  template: `
    <input (change)="onChooseChange()" #uploader style="display:none;"type="file"/>
    <button mat-button (click)="onChooseClick()" >{{textKey | translate}}</button>
  `
})
export class IbUploaderComponent {
  @ViewChild('uploader') uploader !: ElementRef;
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
