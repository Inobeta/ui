import { Component } from '@angular/core';
import { DynamicFormComponent } from 'src/app/inobeta-ui/forms/dynamic-form/dynamic-form.component';
import { FormControlService } from 'src/app/inobeta-ui/forms/form-control.service';

@Component({
  selector: 'ib-material-form',
  templateUrl: './material-form.component.html',
})
export class MaterialFormComponent extends DynamicFormComponent {
  constructor(cs: FormControlService) {
    super(cs);
  }
}
