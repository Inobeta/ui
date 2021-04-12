import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { IbFormControlBase } from '../controls/form-control-base';
import { FormGroup } from '@angular/forms';
import { IbFormControlService } from '../form-control.service';

export interface IbFormAction {
  key?: string;
  label: string;
  handler?: (form: FormGroup) => void;
  options?: any;
}

@Component({
  selector: 'ib-form',
  templateUrl: './dynamic-form.component.html',
})
export class IbDynamicFormComponent implements OnInit, OnChanges {
  @Input() fields: IbFormControlBase<string>[] = [];
  @Input() actions: IbFormAction[] = [
    { key: 'submit', label: 'Save' }
  ];
  @Input() cols: number;
  @Output() ibSubmit = new EventEmitter<any>();
  form: FormGroup;

  constructor(private cs: IbFormControlService) {
  }

  ngOnInit() {
    this.form = this.cs.toFormGroup(this.fields);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const fields = changes['fields'];
    if (fields && !fields.isFirstChange()) {
      this.form = this.cs.toFormGroup(fields.currentValue);
    }
  }

  onSubmit() {
    this.ibSubmit.emit(this.form.getRawValue());
  }

  handleActionClick(source: IbFormAction) {
    if (source.key === 'submit') {
      return;
    }
    source.handler(this.form);
  }
}
