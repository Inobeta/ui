import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBase } from '../form-base';
import { FormGroup } from '@angular/forms';
import { FormControlService } from '../form-control.service';

@Component({
  selector: 'ib-dynamic-form',
  templateUrl: './dynamic-form.component.html',
})
export class DynamicFormComponent implements OnInit {
  @Input() inputs: FormBase<string>[] = [];
  @Output() ibSubmit = new EventEmitter<any>();
  form: FormGroup;

  constructor(private cs: FormControlService) {  }

  ngOnInit() {
    this.form = this.cs.toFormGroup(this.inputs);
  }

  onSubmit() {
    console.log('dynamic form before emit')
    this.ibSubmit.emit(this.form.getRawValue());
  }
}
