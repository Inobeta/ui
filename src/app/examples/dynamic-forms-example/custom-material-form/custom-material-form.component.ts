import { Component, OnInit } from '@angular/core';
import { DynamicFormComponent } from 'src/app/inobeta-ui/forms/dynamic-form/dynamic-form.component';
import { FormControlService } from 'src/app/inobeta-ui/forms/form-control.service';

@Component({
  selector: 'ib-custom-material-form',
  templateUrl: './custom-material-form.component.html',
  styleUrls: ['./custom-material-form.component.css']
})
export class CustomMaterialFormComponent extends DynamicFormComponent {
  constructor(cs: FormControlService) {
    super(cs);
  }
}
