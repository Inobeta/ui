import { Component, OnInit } from '@angular/core';
import { DynamicFormControlComponent } from 'src/app/inobeta-ui/forms/dynamic-form-control/dynamic-form-control.component';

@Component({
  selector: 'ib-custom-material-form-control',
  templateUrl: './custom-material-form-control.component.html',
  styleUrls: ['./custom-material-form-control.component.css']
})
export class CustomMaterialFormControlComponent extends DynamicFormControlComponent {
  constructor() {
    super();
  }
}
