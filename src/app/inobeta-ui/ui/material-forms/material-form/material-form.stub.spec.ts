import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { IbFormControlBase } from "../../forms/controls/form-control-base";
import { IbFormAction } from "../../forms/dynamic-form/dynamic-form.component";

@Component({
  selector: 'ib-material-form',
  template: ``,
})
export class IbMaterialFormStubComponent {
  @Input() fields: IbFormControlBase<string>[] = [];
  @Input() actions: IbFormAction[] = [];
  @Output() ibSubmit = new EventEmitter<any>();
  form: FormGroup;

  constructor() {
  }

  ngOnInit() {
    this.form = this.toFormGroup(this.fields);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const fields = changes['fields'];
    if (fields && !fields.isFirstChange()) {
      this.form = this.toFormGroup(fields.currentValue);
    }
  }


  toFormGroup(fields: IbFormControlBase<any>[]) {
    const group: any = {};

    fields.forEach(field => {
      const elem = {
        value: field.value || '',
        disabled: field.disabled
      }
      let validators = []
      if(field.validators && field.validators.length){
        validators = validators.concat(field.validators)
      }
      if(field.required){
        validators.push(Validators.required)
      }
      group[field.key] = new FormControl(elem, validators);

    });

    return new FormGroup(group);
  }
}
