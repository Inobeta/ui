import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DynamicFormComponent } from 'src/app/inobeta-ui/forms/dynamic-form/dynamic-form.component';
import { FormControlService } from 'src/app/inobeta-ui/forms/form-control.service';
import { FormGroup } from '@angular/forms';

interface CustomMaterialFormAction {
  key?: string;
  label: string;
  handler?: (form: FormGroup) => void;
  options?: any;
}

@Component({
  selector: 'ib-custom-material-form',
  templateUrl: './custom-material-form.component.html',
  styleUrls: ['./custom-material-form.component.css']
})
export class CustomMaterialFormComponent extends DynamicFormComponent {
  @Input() actions: CustomMaterialFormAction[] = [
    { key: 'submit', label: 'Save' }
  ];
  constructor(cs: FormControlService) {
    super(cs);
  }

  handleActionClick(source: CustomMaterialFormAction) {
    if (source.key === 'submit') {
      return;
    }
    source.handler(this.form);
  }
}
