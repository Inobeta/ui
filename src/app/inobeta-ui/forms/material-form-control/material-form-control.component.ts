import { Component, OnInit } from '@angular/core';
import { DynamicFormControlComponent } from 'src/app/inobeta-ui/forms/dynamic-form-control/dynamic-form-control.component';

@Component({
  selector: 'ib-material-form-control',
  templateUrl: './material-form-control.component.html',
})
export class MaterialFormControlComponent extends DynamicFormControlComponent {
  constructor() {
    super();
  }
}
