import { Component, ElementRef, input, output, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'ib-uploader',
  standalone: true,
  imports: [MatButtonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <input (change)="onChooseChange()" #uploader style="display:none;" type="file" />
    <button mat-button type="button" (click)="onChooseClick()">{{ textKey() | translate }}</button>
  `,
})
export class IbUploaderComponent {
  readonly uploader = viewChild.required<ElementRef<HTMLInputElement>>('uploader');

  readonly textKey = input('');
  readonly fileSelected = output<File>();

  onChooseClick(): void {
    this.uploader().nativeElement.click();
  }

  onChooseChange(): void {
    const files = this.uploader().nativeElement.files;
    if (files && files.length > 0) {
      this.fileSelected.emit(files[0]);
      this.uploader().nativeElement.value = '';
    }
  }
}
