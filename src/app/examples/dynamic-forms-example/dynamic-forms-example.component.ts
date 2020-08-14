import { Component, OnInit } from '@angular/core';
import { FormControlBase } from 'src/app/inobeta-ui/forms/controls/form-control-base';
import { Textbox } from 'src/app/inobeta-ui/forms/controls/textbox';
import { Validators } from '@angular/forms';
import { Dropdown } from 'src/app/inobeta-ui/forms/controls/dropdown';
import { Radio } from 'src/app/inobeta-ui/forms/controls/radio';
import { CustomFormActionEvent } from './custom-material-form/custom-material-form.component';

@Component({
  selector: 'app-dynamic-forms-example',
  templateUrl: './dynamic-forms-example.component.html',
  styleUrls: ['./dynamic-forms-example.component.css']
})
export class DynamicFormsExampleComponent implements OnInit {
  defaultFormFields: FormControlBase<string>[] = [
    new Textbox({
      key: 'defaultTextbox',
      label: 'First name',
      required: true,
    })
  ];

  customFormFields: FormControlBase<string>[] = [
    new Textbox({
      key: 'firstName',
      label: 'First name',
      required: true,
      validators: [Validators.minLength(3)]
    }),
    new Textbox({
      type: 'email',
      key: 'email',
      label: 'Email',
      required: true,
      validators: [Validators.email]
    }),
    new Textbox({
      type: 'date',
      key: 'dateTime',
      label: 'Date',
      required: true,
    }),
    new Dropdown({
      key: 'options',
      label: 'Options',
      options: [
        { key: 'test', value: 'value' }
      ]
    }),
    new Radio({
      key: 'food',
      value: 'test-1',
      label: 'Scegli qualcosa',
      options: [
        { key: 'test-1', value: 'Lasagne' },
        { key: 'test-2', value: 'Maccheroni' },
      ],
      required: true
    })
  ];
  customFormActions = [
    { key: 'submit', label: 'Search' },
    {
      key: 'clear',
      label: 'Clear',
      options: { color: 'accent' },
      handler: (form) => form.reset()
    }
  ];

  loginFormFields = [
    new Textbox({
      key: 'username',
      label: 'Username',
      required: true,
      validators: [Validators.minLength(3)]
    }),
    new Textbox({
      key: 'password',
      label: 'Password',
      type: 'password',
      required: true,
      validators: [Validators.minLength(8)]
    })
  ];

  constructor() {}

  ngOnInit() {}

  onSubmit(payload) {
    console.log('example', payload)
  }
}
