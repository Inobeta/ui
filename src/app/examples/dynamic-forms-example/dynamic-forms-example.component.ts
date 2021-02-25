import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IbFormControlBase } from 'src/app/inobeta-ui/ui/forms/controls/form-control-base';
import { IbTextbox } from 'src/app/inobeta-ui/ui/forms/controls/textbox';
import { Validators } from '@angular/forms';
import { IbDropdown } from 'src/app/inobeta-ui/ui/forms/controls/dropdown';
import { IbRadio } from 'src/app/inobeta-ui/ui/forms/controls/radio';
import { IbCheckbox } from 'src/app/inobeta-ui/ui/forms/controls/checkbox';
import { IbMaterialFormComponent } from 'src/app/inobeta-ui/ui/material-forms/material-form/material-form.component';
import { MyCustomTextbox, MyCustomTextboxParams } from './my-custom-textbox.model';

@Component({
  selector: 'app-dynamic-forms-example',
  templateUrl: './dynamic-forms-example.component.html',
  styleUrls: ['./dynamic-forms-example.component.css']
})
export class DynamicFormsExampleComponent implements OnInit, AfterViewInit {
  defaultFormFields: IbFormControlBase<string>[] = [
    new IbTextbox({
      key: 'defaultTextbox',
      label: 'First name',
      required: true,
    })
  ];

  customFormFields: IbFormControlBase<string>[] = [
    new IbTextbox({
      key: 'firstName',
      label: 'First name',
      required: true,
      validators: [Validators.minLength(3)],
      errors: [{
        condition: (c) => c.hasError('required'),
        message: 'Email richiesta'
      }]
    }),
    new IbTextbox({
      type: 'email',
      key: 'email',
      label: 'Email',
      required: true,
      validators: [Validators.email]
    }),
    new IbTextbox({
      type: 'date',
      key: 'dateTime',
      label: 'Date',
      required: true,
    }),
    new IbDropdown({
      key: 'options',
      label: 'Options',
      options: [
        { key: 'test', value: 'value' }
      ]
    }),
    new IbRadio({
      key: 'food',
      value: 'test-1',
      label: 'Scegli qualcosa',
      options: [
        { key: 'test-1', value: 'Lasagne' },
        { key: 'test-2', value: 'Maccheroni' },
      ],
      required: true
    }),
    new IbCheckbox({
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
    new MyCustomTextbox({
      key: 'username',
      label: 'Username',
      required: true,
      testField: 'prova',
      validators: [Validators.minLength(3)]
    } as MyCustomTextboxParams),
    new IbTextbox({
      key: 'password',
      label: 'shared.login.password',
      type: 'password',
      required: true,
      validators: [Validators.minLength(8)]
    })
  ];

  noFormFields = [
    new IbTextbox({
      key: 'old',
      label: 'Old IbTextbox',
    })
  ];

  @ViewChild('customForm', {static: false}) customForm: IbMaterialFormComponent;

  constructor() {}

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    console.log('customForm', this.customForm.form.getRawValue());
    setTimeout(() => {
      this.noFormFields = [
        ...this.noFormFields,
        new IbTextbox({
          key: 'new',
          label: 'New IbTextbox',
        })
      ];
    }, 3000);
  }

  onSubmit(payload) {
    console.log('example', payload);
  }
}
