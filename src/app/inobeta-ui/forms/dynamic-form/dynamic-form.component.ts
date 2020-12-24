import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormControlBase } from '../controls/form-control-base';
import { FormGroup } from '@angular/forms';
import { FormControlService } from '../form-control.service';

interface FormAction {
  key?: string;
  label: string;
  handler?: (form: FormGroup) => void;
  options?: any;
}

@Component({
  selector: 'ib-form',
  templateUrl: './dynamic-form.component.html',
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() fields: FormControlBase<string>[] = [];
  @Input() actions: FormAction[] = [
    { key: 'submit', label: 'Save' }
  ];
  @Output() ibSubmit = new EventEmitter<any>();
  form: FormGroup;

  constructor(private cs: FormControlService) { 
    console.log('dynamic form constructor');
  }

  ngOnInit() {
    console.log('onInit', this.fields);
    this.form = this.cs.toFormGroup(this.fields);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const fields = changes['fields'];
    console.log('onChanges', fields);
    if (fields && !fields.isFirstChange()) {
      this.form = this.cs.toFormGroup(fields.currentValue);
    }
  }

  onSubmit() {
    this.ibSubmit.emit(this.form.getRawValue());
  }

  handleActionClick(source: FormAction) {
    if (source.key === 'submit') {
      return;
    }
    source.handler(this.form);
  }
}
