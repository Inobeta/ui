import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormControlBase } from '../controls/form-control-base';
import { FormGroup } from '@angular/forms';
import { FormControlService } from '../form-control.service';

@Component({
  selector: 'ib-form',
  templateUrl: './dynamic-form.component.html',
})
export class DynamicFormComponent implements OnInit {
  @Input() fields: FormControlBase<string>[] = [];
  @Output() ibSubmit = new EventEmitter<any>();
  form: FormGroup;

  constructor(private cs: FormControlService) {  }

  ngOnInit() {
    this.form = this.cs.toFormGroup(this.fields);
  }

  onSubmit() {
    this.ibSubmit.emit(this.form.getRawValue());
  }
}
