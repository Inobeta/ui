import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IbFormControlBase } from 'src/app/inobeta-ui/ui/forms/controls/form-control-base';
import { IbTextbox } from 'src/app/inobeta-ui/ui/forms/controls/textbox';
import { Validators } from '@angular/forms';
import { IbMaterialFormComponent } from 'src/app/inobeta-ui/ui/material-forms/material-form/material-form.component';
import { MyCustomTextbox, MyCustomTextboxParams } from './my-custom-textbox.model';
import { IbMatTextboxControl } from 'src/app/inobeta-ui/ui/material-forms/controls/textbox';
import { IbMatDropdownControl } from 'src/app/inobeta-ui/ui/material-forms/controls/dropdown';
import { IbMatRadioControl } from 'src/app/inobeta-ui/ui/material-forms/controls/radio';
import { IbMatCheckboxControl } from 'src/app/inobeta-ui/ui/material-forms/controls/checkbox';
import { IbMatDatepickerControl } from 'src/app/inobeta-ui/ui/material-forms/controls/datepicker';
import { IbMatAutocompleteControl } from 'src/app/inobeta-ui/ui/material-forms/controls/autocomplete';
import { IbMatLabelControl } from 'src/app/inobeta-ui/ui/material-forms/controls/label';
import { IbMatTextareaControl } from 'src/app/inobeta-ui/ui/material-forms/controls/textarea';

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

  customFormFields: IbFormControlBase<any>[] = [
    new IbMatTextboxControl({
      key: 'firstName',
      label: 'First name',
      required: true,
      validators: [Validators.minLength(3)],
      width: '50%',
      errors: [{
        condition: (c) => c.hasError('required'),
        message: 'Campo obbligatorio'
      }]
    }),
    new IbMatTextboxControl({
      key: 'disabledField',
      label: 'Disabled Field',
      width: '50%',
      disabled: true
    }),

    new IbMatTextboxControl({
      key: 'changeValueField',
      label: 'Change my value',
      width: '33.3%',
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatTextboxControl({
      type: 'email',
      key: 'email',
      label: 'Email',
      width: '33.3%',
      required: true,
      validators: [Validators.email]
    }),
    new IbMatDatepickerControl({
      type: 'date',
      key: 'dateTime',
      width: '33.3%',
      label: 'Date',
      required: true,
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatDropdownControl({
      key: 'options',
      label: 'Options',
      width: '33.3%',
      options: [
        { key: 'test1', value: 'value1' },
        { key: 'test2', value: 'value2' },
        { key: 'test3', value: 'value3' },
        { key: 'test4', value: 'value4' }
      ],
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatDropdownControl({
      key: 'optionsMultiple',
      label: 'Options Multiple',
      width: '33.3%',
      multiple: true,
      options: [
        { key: 'test1', value: 'value1' },
        { key: 'test2', value: 'value2' },
        { key: 'test3', value: 'value3' },
        { key: 'test4', value: 'value4' }
      ],
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatRadioControl({
      key: 'food',
      value: 'test-1',
      label: 'Scegli qualcosa',
      width: '33.3%',
      options: [
        { key: 'las-1', value: 'Lasagne' },
        { key: 'macc-2', value: 'Maccheroni' },
      ]
    }),
    new IbMatCheckboxControl({
      key: 'checked',
      label: 'check this',
      width: '100%'
    }),

    new IbMatAutocompleteControl({
      key: 'autocomplete',
      label: 'Autocomplete',
      width: '33.3%',
      options: [
        { value: 'value1' },
        { value: 'value2' },
        { value: 'value3' },
        { value: 'value4' }
      ],
      change: (control) => {
        console.log('current value', control.value);
      }
    }),
    new IbMatLabelControl({
      key: 'static',
      value: 'Static value',
      label: 'Static label',
      width: '50%'
    }),

    new IbMatTextareaControl({
      key: 'textarea',
      label: 'Enter long text',
      width: '100%',
      height: '120px'
    }),
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
    new IbMatTextboxControl({
      key: 'password',
      label: 'shared.login.password',
      type: 'password',
      required: true,
      validators: [Validators.minLength(8)]
    })
  ];

  noFormFields = [
    new IbMatTextboxControl({
      key: 'existing',
      label: 'existing IbTextbox',
      width: '50%'
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
        new IbMatTextboxControl({
          key: 'created',
          label: 'created IbTextbox',
          width: '50%'
        })
      ];
    }, 3000);
  }

  onSubmit(payload) {
    console.log('example', payload);
  }
}
