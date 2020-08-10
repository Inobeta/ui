import { Component, OnInit } from '@angular/core';
import { FormBase } from 'src/app/inobeta-ui/forms/form-base';
import { Textbox } from 'src/app/inobeta-ui/forms/form-textbox';
import { Validators } from '@angular/forms';
import { Dropdown } from 'src/app/inobeta-ui/forms/form-dropdown';

@Component({
  selector: 'app-dynamic-forms-example',
  templateUrl: './dynamic-forms-example.component.html',
  styleUrls: ['./dynamic-forms-example.component.css']
})
export class DynamicFormsExampleComponent implements OnInit {
  inputs: FormBase<string>[]

  constructor() {
    this.inputs = [
      new Textbox({
        key: 'firstName',
        label: 'First name',
        value: 'Bombasto',
        required: true,
        validators: [Validators.minLength(3)]
      }),
      new Textbox({
        type: 'email',
        key: 'email',
        label: 'Email',
        value: '',
        required: true,
      }),
      new Textbox({
        type: 'date',
        key: 'dateTime',
        label: 'Date',
        required: true,
      }),
      new Dropdown({
        key: 'options',
        label: 'options',
        options: [
          {key: 'test', value: 'test'}
        ]
      })
    ]
  }

  ngOnInit() {
  }

  onSubmit(payload) {
    console.log('example', payload)
  }

}
