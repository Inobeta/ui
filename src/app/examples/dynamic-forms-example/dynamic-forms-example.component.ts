import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormControlBase } from 'src/app/inobeta-ui/modules/ui/forms/controls/form-control-base';
import { Textbox } from 'src/app/inobeta-ui/modules/ui/forms/controls/textbox';
import { Validators } from '@angular/forms';
import { Dropdown } from 'src/app/inobeta-ui/modules/ui/forms/controls/dropdown';
import { Radio } from 'src/app/inobeta-ui/modules/ui/forms/controls/radio';
import { Checkbox } from 'src/app/inobeta-ui/modules/ui/forms/controls/checkbox';
import { MaterialFormComponent } from 'src/app/inobeta-ui/modules/ui/material-forms/material-form/material-form.component';

@Component({
  selector: 'app-dynamic-forms-example',
  templateUrl: './dynamic-forms-example.component.html',
  styleUrls: ['./dynamic-forms-example.component.css']
})
export class DynamicFormsExampleComponent implements OnInit, AfterViewInit {
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
      validators: [Validators.minLength(3)],
      errors: [{
        condition: (c) => c.hasError('required'),
        message: 'Email richiesta'
      }]
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
    }),
    new Checkbox({
      key: 'checked',
      label: 'check this',
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
      label: 'shared.login.password',
      type: 'password',
      required: true,
      validators: [Validators.minLength(8)]
    })
  ];

  noFormFields = [
    new Textbox({
      key: 'old',
      label: 'Old Textbox',
    })
  ];

  @ViewChild('customForm', {static: false}) customForm: MaterialFormComponent;

  constructor() {}

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    console.log('customForm', this.customForm.form.getRawValue());
    setTimeout(() => {
      this.noFormFields = [
        ...this.noFormFields,
        new Textbox({
          key: 'new',
          label: 'New Textbox',
        })
      ];
    }, 3000);
  }

  onSubmit(payload) {
    console.log('example', payload);
  }
}
