import { Component } from '@angular/core';
import { IbToastNotification } from 'src/app/inobeta-ui/ui/toast/toast.service';

@Component({
  selector: 'ib-toast-example',
  template: `
  <div>
    <button (click)="open()">open success toast</button>
    <button (click)="open('warning')">open warning toast</button>
    <button (click)="open('error')">open error toast</button>
  </div>
  `
})

export class IbToastExampleComponent {
  constructor(private toast: IbToastNotification) { }

  open(type = 'success'){
    this.toast.open('examples.toastMessage', type)
  }
}
